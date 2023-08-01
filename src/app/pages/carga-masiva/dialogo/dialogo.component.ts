import { ConstantPool } from '@angular/compiler';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InfoCapturaSPEIPago } from 'src/app/_model/InfoCapturaSPEIPago';
import { Transacciones } from 'src/app/_model/transacciones';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { LoginService } from 'src/app/_service/login.service';
import * as XLSX from 'xlsx';
import { DialogoDialogCleanComponent } from './dialogo-dialog-clean/dialogo-dialog-clean.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, delay, finalize, of } from 'rxjs';
import { requestDatosTransferencias } from 'src/app/_modelRequest/requestdatosTransferencias';
import { InfoSpei } from 'src/app/_model/InfoSpei';
import { requestOtp } from 'src/app/_modelRequest/requestOtp';
import { InfoLoginService } from 'src/app/_service/info-login.service';
import { DialogoDialogCreateComponent } from './dialogo-dialog-create/dialogo-dialog-create.component';
import { InfoCuentaclabeService } from 'src/app/_service/info-cuentaclabe.service';
import { requesteClaveRastreo } from 'src/app/_modelRequest/requestClaveRastreo';
import { InfoBancos } from 'src/app/_model/InfoBancos';
import { InfoBancosService } from 'src/app/_service/info-bancos.service';
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { InfoPagosService } from 'src/app/_service/info-pagos.service';

@Component({
  selector: 'app-dialogo',
  templateUrl: './dialogo.component.html',
  styleUrls: ['./dialogo.component.css'],
})
export class DialogoComponent implements OnInit {
  tran: Transacciones[] = []; //variable donde se almacenaran los datos del excel para exponer en la pantalla
  envioMazivo: InfoCapturaSPEIPago[] = [];
  datos: any[] = []; //datos que trae el excel
  divEscondido: boolean = true; //la variable del div que contiene la tabla de los datos del excel
  codigoOTP: string = '';
  mostrarSpinner: boolean = false;
  clabeMadre: string = "";
  claveDeRastreo: string = "";
  montoTotal!: number; //total del monto de todos los  datos
  displayedColumns: string[] = [
    'Destino',
    'Beneficiario',
    'Número de Cuenta',
    'Banco',
    'Monto',
    'Ref. Num',
    'Concepto Pago',
  ];
  dataSource!: MatTableDataSource<InfoCapturaSPEIPago>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(
    private loginService: LoginService,
    private dialogRef: MatDialogRef<DialogoComponent>,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private infoCuentaClabeService: InfoCuentaclabeService,
    private infoPagosService: InfoPagosService,
    private infoBancoService: InfoBancosService
  ) { }

  ngAfterViewInit() {

    this.montoTotal = 0;
    if (this.localStorageService.getExcelList('listExel') != null) {
      this.envioMazivo = this.localStorageService.getExcelList('listExel');
      this.dataSource = new MatTableDataSource(this.envioMazivo);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.divEscondido = false;
      this.cd.detectChanges();
    } else {
      this.divEscondido = true;

    }

    for (let m of this.envioMazivo) {
      this.montoTotal = this.montoTotal + parseFloat(m.monto);
    }
    this.cd.detectChanges();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngOnInit(): void {
    this.listarBanaco();
    this.montoTotal = 0;
    if (this.localStorageService.getExcelList('listExel') != null) {
      this.envioMazivo = this.localStorageService.getExcelList('listExel');
      this.dataSource = new MatTableDataSource(this.envioMazivo);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.divEscondido = false;
    } else {
      this.dataSource = new MatTableDataSource(this.envioMazivo);
      // this.divEscondido = false;
    }
    for (let m of this.envioMazivo) {
      this.montoTotal = this.montoTotal + parseFloat(m.monto);
    }
  }

  busquedaCuentaConcentradora() {
    let res = { "peiyu": this.localStorageService.getUsuario("pblu") }
    this.infoCuentaClabeService.buscarPbluConCuenta(res).subscribe(data => {
      let clabe = {
        "clabe": data.clabe_pblu,
        "pblu": this.localStorageService.getUsuario("pblu")
      };
      this.infoCuentaClabeService.buscarCuentaExiste(clabe).subscribe(d => {
        if (d != null) {
          this.clabeMadre = d.clabe;
        }
      })
    })
  }

  generadorDeClave(): string {
    let request = new requesteClaveRastreo();
    request.idParticipante = this.localStorageService.getUsuario("pblu").toString();
    this.infoBancoService.generarClaveRastreo(request).pipe(
      finalize(() => {
        return this.claveDeRastreo;
      })).subscribe((data: { claveRastreo: string; }) => {
        this.claveDeRastreo = data.claveRastreo;
      });
    return 'XXXXXXXXXXXXXXXXX';
  }

  cargarArchivo2(event: Event) {

    this.busquedaCuentaConcentradora();
    this.montoTotal = 0;
    this.envioMazivo = [];
    this.localStorageService.removeExecel();
    this.ngAfterViewInit();
    const inputElement = event.target as HTMLInputElement;
    let archivo = inputElement.files;
    let flag = false;
    if (archivo != null) {
      this.envioMazivo = [];
      this.dataSource = new MatTableDataSource(this.envioMazivo);
      this.dataSource.paginator = this.paginator;
      const lector = new FileReader();
      lector.readAsBinaryString(archivo[0]);
      this.cd.detectChanges();
      lector.onload = () => {
        const libro = XLSX.read(lector.result, { type: 'binary' });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        this.datos = XLSX.utils.sheet_to_json(hoja);
        let aux = 0;
        for (let i = 0; i < this.datos.length; i++) {
          aux++;
          if (
            this.datos[i]['Destino'] &&
            this.datos[i]['Nombre Beneficiario'] &&
            this.datos[i]['Numero de cuenta'] &&
            this.datos[i]['Institucion bancaria'] &&
            this.datos[i]['Monto'] &&
            this.datos[i]['Referencia Numerica'] &&
            this.datos[i]['Concepto pago']
          ) {
            let trans = new InfoCapturaSPEIPago();
            if (this.datos[i]['Destino'] != this.datos[i]['Numero de cuenta'] && this.datos[i]['Destino'].length <= 18 && this.validarSoloNumeros(this.datos[i]['Destino']) == true) {
              trans.ctaDestino = this.datos[i]['Destino'];
            } else {
              this.divEscondido = true;
              flag = false
              this.snackBar.open(
                'Carga interrumpida: Cuenta destino no puede ser igual a la clabe, favor de verificar documento.',
                'Cerrar',
                { duration: 3000 }
              );

            }
          
          } else {
            this.snackBar.open(
              'Carga interrumpida: Campos incompletos, favor de verificar documento.',
              'Cerrar',
              { duration: 3000 }
            );
            break;
          }
        }
        //Otros Ifs 
        if (this.datos.length === 0) {
          flag = true;
          this.divEscondido = true;
          this.datos = [];
          this.snackBar.open(
            'Carga interrumpida: Archivo sin datos, favor de verificar documento.',
            'Cerrar',
            { duration: 3000 }
          );
        }
        if (!flag) {
          this.localStorageService.setExcelList('listExel', this.envioMazivo);
          //this.divEscondido = false;
          this.ngAfterViewInit();
        }
        for (let j = 0; j < this.envioMazivo.length; j++) {
          if (
            this.envioMazivo[j].ctaDestino.length == 18 &&
            this.envioMazivo[j].clabe.length == 18
          ) {
            //TODO: Validar que la cuenta destino sea igual a la clabe
          }
        }
      };
    } else {
      this.divEscondido = true;
    }
  }

  Salir() {
    this.dialogRef.close();
  }
  removeXLSX() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '40%';
    dialogConfig.height = '40%';
    dialogConfig.disableClose = false;
    const dialogRef = this.dialog.open(
      DialogoDialogCleanComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.envioMazivo = [];
        this.montoTotal = 0;
        this.localStorageService.removeExecel();
        this.ngAfterViewInit();
        this.divEscondido = true;
        this.snackBar.open('Datos Removidos', 'Cerrar', {
          duration: 2000,
        });
      } else {
        this.divEscondido = false;
      }
    });
  }

  requestList: InfoCapturaSPEIPago[] = [];
  a = 1;
  listasACargar: any[] = [];
  enviar() {
    let aux = 0;
    this.requestList = [];
    if (this.codigoOTP != '') {
      this.mostrarSpinner = true;
      let InfSpei = new InfoSpei();
      InfSpei = this.localStorageService.getUsuario('userE');
      let pblu = this.localStorageService.getIdPblu('pblu');
      let token = this.localStorageService.getDesc('token');
      let request = new requestOtp();
      request.idUsuario = InfSpei.idUsuario;
      request.otp = this.codigoOTP.trim();

      /*  this.loginServices
          .verificarOtp(request)
          .pipe(
            catchError((error) => {
              this.mostrarSpinner = false;
              this.snackBar.open('Error codigo OTP, Intente de nuevo', 'Cerrar', {
                duration: 2000,
              });
              return of(null);
            })
          )
          .subscribe((data) => {*/
      this.mostrarSpinner = true;
      // if (data?.mensaje == 'Otp validado correctamente') {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '40%';
      dialogConfig.height = '40%';
      dialogConfig.disableClose = false;
      const dialogRef = this.dialog.open(
        DialogoDialogCreateComponent,
        dialogConfig
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          for (let i = 0; i < this.envioMazivo.length; i++) {
            let request = new requesteClaveRastreo();
            request.idParticipante = this.localStorageService.getUsuario("pblu").toString();
            //   this.infoBancoService.generarClaveRastreo(request).pipe(
            //   finalize(() => {
            aux++;
            let speiout = new InfoCapturaSPEIPago();
            speiout.username = InfSpei.username;
            speiout.password = InfSpei.password;
            speiout.certificado = InfSpei.certificado;
            speiout.llave = InfSpei.llave;
            speiout.phrase = InfSpei.phrase;
            speiout.ctaDestino = this.envioMazivo[i].ctaDestino;
            speiout.nombreDestino = this.envioMazivo[i].nombreDestino;
            speiout.clabe = this.envioMazivo[i].clabe;
            speiout.bancoDestino = this.buscarIdBanco(this.envioMazivo[i].ctaDestino).toString();
            speiout.monto = this.envioMazivo[i].monto;
            speiout.refNum = this.envioMazivo[i].refNum;
            speiout.conceptoPago = this.envioMazivo[i].conceptoPago;
            speiout.cveRastreo = this.claveDeRastreo;
            this.requestList.push(speiout);
            if (this.requestList.length == this.envioMazivo.length) {

              this.agregarDatosCola(this.requestList);


              this.realiazarPagoMazivo();
              this.a++;

              //this.Salir();//Ojo aqui hugo aqui llamas el api para hacer el envio de spei
            }
            // })).subscribe((data: { claveRastreo: string; }) => {
            // this.claveDeRastreo = data.claveRastreo;
            //});

          }

        }
      });
      //}
      //});
    }

  }


  agregarDatosCola(request: InfoCapturaSPEIPago[]) {

    this.listasACargar.push(request);
    console.log(this.listasACargar)
  }
  realiazarPagoMazivo() {
    console.log(this.listasACargar, "Este es el de la cola")
    from(this.listasACargar).pipe(
      concatMap((lista) => this.infoPagosService.realizarPagoMazivo(lista))
    ).subscribe(
      (data) => {
        // Este bloque se ejecutará si la solicitud se completa sin errores.
        console.log(data)
        // Aquí puedes realizar acciones con la respuesta exitosa si es necesario.
      },
      (error) => {
        // Este bloque se ejecutará si ocurre un error durante la solicitud.

        // Aquí puedes realizar acciones para manejar el error, si es necesario.
        // También puedes dejar este bloque vacío si no deseas hacer nada con el error y permitir que el flujo continúe normalmente.
      },
      () => {


      }
    );
  }
  buscarIdBanco(a: string): number {
    const primerasTresLetras: string = a.substring(0, 3);
    const bancoEncontrado = this.listaBancos.find(banco => banco.id_banco.toString().substr(2) === primerasTresLetras);
    if (bancoEncontrado) {
      return bancoEncontrado.id_banco;
    }
    return 0;
  }
  listaBancos: InfoBancos[] = [];
  listarBanaco() {//aqui se carga la lista de los bancos disponibles
    this.infoBancoService.listar().subscribe((bancos) => {
      this.listaBancos = bancos;
    })
  }
  validarDatoNoNumeros(dato: string): boolean {
    const regex = /^[A-Za-z\s]*$/;
    return regex.test(dato);
  }
  validarSoloNumeros(dato: string): boolean {
    const regex = /^\d+$/;
    return regex.test(dato);
  }

}
