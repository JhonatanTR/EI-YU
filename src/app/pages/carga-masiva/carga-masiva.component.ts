import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogoComponent } from './dialogo/dialogo.component';
import { InfoCapturaSPEIPago } from 'src/app/_model/InfoCapturaSPEIPago';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { InfoPagosService } from 'src/app/_service/info-pagos.service';
import { InfoCuentaclabeService } from 'src/app/_service/info-cuentaclabe.service';
import { requesteClaveRastreo } from 'src/app/_modelRequest/requestClaveRastreo';
import { InfoBancos } from 'src/app/_model/InfoBancos';
import { InfoBancosService } from 'src/app/_service/info-bancos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Subscription,
  catchError,
  defer,
  delay,
  finalize,
  of,
  share,
  tap,
} from 'rxjs';
import { Pagos } from 'src/app/_model/Pagos';
import { HttpClient } from '@angular/common/http';
import { PagoDataService } from 'src/app/_service/pago-data.service';
import { Archivos } from '../../_model/Archivos';

@Component({
  selector: 'app-carga-masiva',
  templateUrl: './carga-masiva.component.html',
  styleUrls: ['./carga-masiva.component.css'],
})
export class CargaMasivaComponent implements OnInit, OnDestroy {
  requestList: InfoCapturaSPEIPago[] = [];
  claveDeRastreo: string = '123';
  nombreArchivo: string = '';
  fecha: string = '';
  pagos: Pagos[] = [];
  pagosSubscription: Subscription = new Subscription();
  idCounter: number = 0;
  listaBancos: InfoBancos[] = [];
  initialPagosData: Pagos[] = []; // Variable para almacenar los datos iniciales del localStorage
  lastPaymentId: number = 0; // Variable para almacenar el último ID del último pago
  pagosProcesados: Pagos[] = [];
  archivos: Pagos[] = [];
  private postSubscription: Subscription = new Subscription();

  constructor(
    private dialog: MatDialog,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackBar,
    private infoPagosService: InfoPagosService,
    private http: HttpClient,
    private infoBancoService: InfoBancosService,
    public pagoDataService: PagoDataService
  ) {}
  ngOnInit(): void {
    this.listarBanaco();
    // Verificar si hay pagos almacenados en el localStorage
    const localStorageKeys = Object.keys(localStorage);
    for (const key of localStorageKeys) {
      if (key.startsWith('pago_')) {
        const paymentDataWithExpiration = JSON.parse(
          localStorage.getItem(key)!
        );
        const expirationDate = paymentDataWithExpiration.expirationDate;
        const currentTime = new Date().getTime();

        // Si la fecha de vencimiento ha pasado, eliminar el pago
        if (currentTime >= expirationDate) {
          const idPago = parseInt(key.split('_')[1], 10);
          this.pagoDataService.deletePayment(idPago);
          localStorage.removeItem(key);
        }
      }
    }
    const storedPagos = localStorage.getItem('pagos');
    if (storedPagos) {
      this.pagos = JSON.parse(storedPagos);
    }
    const storedArchivos = localStorage.getItem('archivos');
    if (storedArchivos) {
      this.archivos = JSON.parse(storedArchivos);
    }

    // Suscribirse a los cambios en el arreglo pagos del servicio
    this.pagosSubscription = this.pagoDataService.pagosUpdated.subscribe(
      (pagos: Pagos[]) => {
        this.pagos = pagos;
        this.lastPaymentId = this.pagoDataService.getLastPaymentId(); // Actualizar el último ID del último pago
      }
    );
    this.pagosSubscription =
      this.pagoDataService.pagosProcesadosUpdated.subscribe(
        (pagosProcesados: Pagos[]) => {
          this.archivos = pagosProcesados;
        }
      );
  }
  ngOnDestroy(): void {
    this.pagosSubscription.unsubscribe();
    if (this.postSubscription && !this.postSubscription.closed) {
      this.postSubscription.unsubscribe();
    }
  }

  listarBanaco() {
    //aqui se carga la lista de los bancos disponibles
    this.infoBancoService.listar().subscribe((bancos) => {
      this.listaBancos = bancos;
    });
  }
  deletePayment(idPago: number) {
    this.pagos = this.pagos.filter((pago) => pago.Id !== idPago);
  }
  añadirPago(Archivo: string, Fecha: string, Datos: any[]) {
    //añade un pago a la lista de pagos
    this.lastPaymentId = this.pagoDataService.getLastPaymentId(); // Actualizar el último ID del último pago
    this.lastPaymentId++;
    const pago = new Pagos(
      this.lastPaymentId,
      Archivo,
      Fecha,
      'Procesando',
      false,
      Datos
    );
    this.pagoDataService.addPaymentWithExpiration(pago, pago.Id);
    return pago.Id;
  }
  // Método para cambiar la descripción de un pago finalizado
  actualizarEstatus(Id: number, Estatus: string) {
    const pagoActualizado = this.pagos.find((pago) => pago.Id === Id);
    if (pagoActualizado) {
      pagoActualizado.Estatus = Estatus;
      pagoActualizado.Bandera = true;
      this.pagoDataService.updatePayment(pagoActualizado);
    }
  }

  openDialog() {
    //abre el dialgo de carga masiva
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '95%'; // establece el ancho del diálogo al 50% del ancho de la pantalla
    dialogConfig.height = '90%'; // establece la altura del diálogo al 50% del alto de la pantalla
    dialogConfig.maxWidth = '95%'; // establece el ancho máximo del diálogo al 90% del ancho de la pantalla
    dialogConfig.maxHeight = '95%'; // establece la altura máxima del diálogo al 90% del alto de la pantalla
    dialogConfig.disableClose = false; // desactiva la opción de cerrar el diálogo haciendo clic fuera de él
    const dialogRef = this.dialog.open(DialogoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      //Destructura el resultado del dialogo
      if (result) {
        const { Bandera, Archivo, Fecha, Datos, DatosSPEI } = result;
        if (Bandera) {
          let aux = 0;
          for (let i = 0; i < Datos.length; i++) {
            let request = new requesteClaveRastreo();
            request.idParticipante = this.localStorageService
              .getUsuario('pblu')
              .toString();
            //   this.infoBancoService.generarClaveRastreo(request).pipe(
            //   finalize(() => {
            aux++;
            let speiout = new InfoCapturaSPEIPago();
            speiout.username = DatosSPEI.username;
            speiout.password = DatosSPEI.password;
            speiout.certificado = DatosSPEI.certificado;
            speiout.llave = DatosSPEI.llave;
            speiout.phrase = DatosSPEI.phrase;
            speiout.ctaDestino = Datos[i].ctaDestino;
            speiout.nombreDestino = Datos[i].nombreDestino;
            speiout.clabe = Datos[i].clabe;
            speiout.bancoDestino = this.buscarIdBanco(
              Datos[i].ctaDestino
            ).toString();
            speiout.monto = Datos[i].monto;
            speiout.refNum = Datos[i].refNum;
            speiout.conceptoPago = Datos[i].conceptoPago;
            speiout.cveRastreo = this.claveDeRastreo;
            this.requestList.push(speiout);
            //this.agregarDatosCola(this.requestList);
            //this.realiazarPagoMazivo();
            //.a++;

            // })).subscribe((data: { claveRastreo: string; }) => {
            // this.claveDeRastreo = data.claveRastreo;
            //});
          }
          if (this.postSubscription && !this.postSubscription.closed) {
            this.postSubscription.unsubscribe();
          }

          const post = defer(() => {
            const pagoId = this.añadirPago(Archivo, Fecha, Datos);
            this.pagos = this.pagoDataService.getPagos();
            return this.infoPagosService
              .realizarPagoMazivo(this.requestList)
              .pipe(
                tap(() => {
                  console.log('Terminó la petición');
                  this.actualizarEstatus(pagoId, 'Procesado');
                  this.snackBar.open('Carga masiva exitosa', 'Cerrar', {
                    duration: 3000,
                  });
                })
                share() // Utilizamos el operador share para compartir la suscripción
              );
          });
          post.subscribe((data) => {
            console.log(data);
          });

          // Llamada a la función post y asignación de la suscripción
          this.postSubscription = post.subscribe(
            () => {
              console.log('Petición realizada con éxito');
            },
            (error) => {
              console.error('Error en la petición', error);
            }
          );

          /* this.infoPagosService
            .realizarPagoMazivo(this.requestList)
            .pipe(
              finalize(() => {
                //Fin de la animacion
                // Este bloque se ejecutará al final de la suscripción, una vez que se completen todas las solicitudes.
              })
            )
            .subscribe(
              (data) => {
                // Este bloque se ejecutará si la solicitud se completa sin errores.
                console.log(data, 'Exito');
                // Aquí puedes realizar acciones con la respuesta exitosa si es necesario.
              },
              (error) => {
                // Este bloque se ejecutará si ocurre un error durante la solicitud.
                console.error(
                  'Error en la solicitud, intente nuevamente:',
                  error
                );
                this.snackBar.open(
                  'Error en la solicitud, intente nuevamente',
                  'Cerrar',
                  {
                    duration: 3000,
                  }
                );
                // Aquí puedes realizar acciones para manejar el error, si es necesario.
                // También puedes dejar este bloque vacío si no deseas hacer nada con el error y permitir que el flujo continúe normalmente.
              }
            );*/
        }
      }
    });
  }

  buscarIdBanco(a: string): number {
    const primerasTresLetras: string = a.substring(0, 3);
    const bancoEncontrado = this.listaBancos.find(
      (banco) => banco.id_banco.toString().substr(2) === primerasTresLetras
    );
    if (bancoEncontrado) {
      return bancoEncontrado.id_banco;
    }
    return 0;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload($event: any): string | void {
    if (this.pagoDataService.isLoading) {
      $event.returnValue =
        'Hay una operación en curso. ¿Estás seguro de que quieres recargar la página?';
    }
    // Verificar si los datos del localStorage siguen iguales después del refresco
    const currentPagosData = localStorage.getItem('pagos');
    if (currentPagosData !== null) {
      const currentPagos: Pagos[] = JSON.parse(currentPagosData);

      // Filtrar los pagos con el estatus 'Procesado'
      const updatedPagos: Pagos[] = currentPagos.filter(
        (pago) => pago.Estatus === 'Procesado'
      );

      // Actualizar el arreglo 'pagos' del componente con los pagos filtrados
      this.pagos = updatedPagos;
      this.pagoDataService.updatePagos(updatedPagos);
      // Guardar los datos actualizados en el localStorage
      //localStorage.setItem('pagos', JSON.stringify(updatedPagos));
    }
  }
}
