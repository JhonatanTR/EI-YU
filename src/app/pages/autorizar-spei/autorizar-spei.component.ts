import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, of } from 'rxjs';
import { InfoAutorizarSpei } from 'src/app/_model/InfoAutorizarSpei';
import { InfoCapturaSPEI } from 'src/app/_model/InfoCapturaSPEI';
import { InfoCapturaSPEIPago } from 'src/app/_model/InfoCapturaSPEIPago';
import { InfoSpei } from 'src/app/_model/InfoSpei';
import { requestOtp } from 'src/app/_modelRequest/requestOtp';
import { InfoLoginService } from 'src/app/_service/info-login.service';
import { InfoPagosService } from 'src/app/_service/info-pagos.service';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { DialogErrorListPagoComponent } from './dialog-error-list-pago/dialog-error-list-pago.component';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { InfoBancosService } from 'src/app/_service/info-bancos.service';
import { InfoBancos } from 'src/app/_model/InfoBancos';

@Component({
  selector: 'app-autorizar-spei',
  templateUrl: './autorizar-spei.component.html',
  styleUrls: ['./autorizar-spei.component.css']
})

export class AutorizarSpeiComponent implements OnInit {

  selection = new SelectionModel<InfoAutorizarSpei>(true, []); // Selección de filas en la tabla
  @ViewChild(MatPaginator) paginator!: MatPaginator; // Referencia al paginador de la tabla
  dataSource!: MatTableDataSource<InfoAutorizarSpei>; // Fuente de datos de la tabla
  displayedColumns: string[] = ['select', 'dato1', 'dato2', 'dato3', 'dato4', 'dato5', 'dato6', 'dato8', 'dato9']; // Columnas a mostrar en la tabla
  otp: string = ""; // Código OTP ingresado
  Listspeiout: InfoAutorizarSpei[] = []; // Lista de pagos
  total: number = 0; // Total de los montos de los pagos seleccionados
  letraColor = 'black'; // Color del texto
  adm = false; // Variable de control para el acceso administrativo
  listaErroSpei: InfoAutorizarSpei[] = [];//Aqui se enlista de los spei que no se pudieron enviar 
  listaErroSpeiTabla: InfoAutorizarSpei[] = [];//Este es un Aux que las guarda

  mostrarSpinner = false;
  constructor(private infoBancoService: InfoBancosService, private localStorageService: LocalStorageService, private dialog: MatDialog, private storage: LocalStorageService, private _snackBar: MatSnackBar, private infoPagosService: InfoPagosService, private infoLoginService: InfoLoginService) {
    this.dataSource = new MatTableDataSource<InfoAutorizarSpei>([]); // Inicialización de la fuente de datos de la tabla
  }
  rol: number = 0;
  ngOnInit(): void {
    this.listarBanaco();
    this.selection = new SelectionModel<InfoAutorizarSpei>(true, []); // Inicialización de la selección de filas
    // Obtener la lista de pagos
    if (this.localStorageService.getDat("permiso") != 3) {
      if (this.localStorageService.getDat("rol")) {
        this.adm = false;
        this.rol = 1;
        this.listaDeSpeiOut();

      } else if (this.localStorageService.getDat("permiso") == 2) {
        this.rol = 2;
        this.adm = true;
        this.listaDeSpeiOutRol();
      }
    } else {
      this.rol = 2;
      this.adm = false;
      this.listNoPagadoRolIntermedio();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator; // Configuración del paginador de la tabla
  }

  // Resto del código...

  aver: InfoAutorizarSpei[] = [];
  listaDeSpeiOut() {//Se consulta la lista de todos los spei out
    let dat: any = {
      "estatus": false,
      "pblu": this.localStorageService.getUsuario("pblu")
    }
    this.infoPagosService.listarPagoSoloTrue(dat).pipe(
      catchError((error) => {
        this.openSnackBar('Se produjo un error de conexión. Por favor, inténtelo de nuevo más tarde.', 'Aviso');
        return of([]);
      })).subscribe(lista => {
        this.aver = lista;
        this.dataSource = new MatTableDataSource<InfoAutorizarSpei>(lista); //aqui se setea los datos a la tabla con la consulta
        this.dataSource.paginator = this.paginator;
      })
  }
  listaDeSpeiOutRol() {//Se consulta la lista de todos los spei out
    let dat: any = {
      "estatus": false,
      "pblu": this.localStorageService.getUsuario("pblu"),
      "id_rol": this.rol,
      "id_usuario": this.localStorageService.getDesc("usuario")
    }
    this.infoPagosService.listarPagoSoloTrueRol(dat).pipe(
      catchError((error) => {
        this.openSnackBar('Se produjo un error de conexión. Por favor, inténtelo de nuevo más tarde.', 'Aviso');
        return of([]);
      })).subscribe(lista => {
        this.aver = lista;
        this.dataSource = new MatTableDataSource<InfoAutorizarSpei>(lista); //aqui se setea los datos a la tabla con la consulta
        this.dataSource.paginator = this.paginator;
      })
  }
  listNoPagadoRolIntermedio() {//Se consulta la lista de todos los spei out
    let a = { "id_usuario_autoriza": this.localStorageService.getDesc("idUser_1") }
    this.infoPagosService.buscarLlaveUsuario(a).subscribe(dat => {
      let b = { "id": parseInt(dat) }
      this.infoLoginService.buscarNomUsuarioPorId(b).subscribe(date => {
        let dat: any = {
          "estatus": false,
          "pblu": this.localStorageService.getUsuario("pblu"),
          "id_rol": this.rol,
          "id_usuario": date.nomUsuario
        }


        this.infoPagosService.listarPagoSoloTrueRolIntermedio(dat).pipe(
          catchError((error) => {
            this.openSnackBar('Se produjo un error de conexión. Por favor, inténtelo de nuevo más tarde.', 'Aviso');
            return of([]);
          })).subscribe(lista => {
            this.aver = lista;
            this.dataSource = new MatTableDataSource<InfoAutorizarSpei>(lista); //aqui se setea los datos a la tabla con la consulta
            this.dataSource.paginator = this.paginator;
          })

      })
    })


  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  toggleAllRowss() {

    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();

      let a = new InfoAutorizarSpei
      a.id == 0;
      this.datos(a);
      return;
    }
    this.selection.select(...this.dataSource.data);
    this.total = 0;
    this.sumar(this.selection.selected);
  }
  info: InfoAutorizarSpei[] = [];//Es un auxiliar de la lista de spei
  sumar(row: InfoAutorizarSpei[]) {
    row.forEach(d => {
      this.info.push(d)
      this.total = parseFloat(this.total.toFixed(2)) + parseFloat(d.monto.toFixed(2));
    })
  }
  datos(row: InfoAutorizarSpei) {
    const index = this.info.findIndex(item => item.id === row.id);
    if (index === -1) {
      // El elemento no existe en el array, agregarlo
      this.info.push(row);
      this.total = parseFloat(this.total.toFixed(2)) + parseFloat(row.monto.toFixed(2));
    } else {
      // El elemento ya existe en el array, eliminarlo
      this.info.splice(index, 1);
      this.total = parseFloat(this.total.toFixed(2)) - parseFloat(row.monto.toFixed(2));;
    }
    if (row.id == 0) {
      this.info = [];
      this.total = 0;
    }
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: InfoAutorizarSpei): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
  btnBloquear() {//SEbloquea el boton del envio del pago si no se a seleccionado 
    return this.selection.selected.length <= 0;
  }

  obtenerCuentaEnmascarada(cuenta: string): string {
    const tresPrimeros = cuenta.slice(0, 3);
    const dosUltimos = cuenta.slice(-4);
    return `***${dosUltimos}`;
  }
  listaBancos: InfoBancos[] = [];
  listarBanaco() {//aqui se carga la lista de los bancos disponibles
    this.infoBancoService.listar().subscribe(bancos => {
      this.listaBancos = bancos;
    })

  }
  
    buscarIdBanco(a: string): number {
      const primerasTresLetras: string = a.substring(0, 3);
      const bancoEncontrado = this.listaBancos.find(banco => banco.id_banco.toString().substr(2) === primerasTresLetras);
    
      if (bancoEncontrado) {
        return bancoEncontrado.id_banco;
      }
      return 0;
    }
    
    enviarList() {//Aqui se hace el envio de la lista de La autorizacion de Spei
    this.listaErroSpei = []
    this.mostrarSpinner = true;
    let InfSpei = new InfoSpei();
    InfSpei = this.storage.getUsuario("userE");
    let request = new requestOtp();
    request.idUsuario = InfSpei.idUsuario;
    request.otp = this.otp.trim()
    this.infoLoginService.verificarOtp(request).pipe(
      catchError((error) => {
        this.openSnackBar('Error codigo OTP, Intente de nuevo', 'Aviso');
        this.otp = "";
        return of(null);
      })
    ).subscribe((data) => {
     
      if (data?.mensaje == "Otp validado correctamente") {
        const pagosObservables = this.info.map(info => {
          let speiout = new InfoCapturaSPEIPago();
          speiout.username = InfSpei.username;
          speiout.password = InfSpei.password;
          speiout.certificado = InfSpei.certificado;
          speiout.llave = InfSpei.llave;
          speiout.phrase = InfSpei.phrase;
          speiout.nombreDestino = info.beneficiario;
          speiout.ctaDestino = info.destino;
          speiout.clabe = info.numerodecuenta;
          speiout.monto = info.monto.toString();
          speiout.refNum = info.refnumerica;
          speiout.cveRastreo = info.claberastreo;
          speiout.conceptoPago = info.conceptopago;
          speiout.bancoDestino= this.buscarIdBanco(info.destino).toString();
          
          return this.infoPagosService.realizarPago(speiout).pipe(
            catchError(() => of(null))
          );
        });

        forkJoin(pagosObservables).pipe(
          finalize(() => {
            this.mostrarSpinner = false;
            this.selection.clear();
            this.total = 0;
            this.info = [];
            if (this.listaErroSpei.length > 0) {
              this.openDiaCuenta(this.listaErroSpei);

            }
          })
        ).subscribe(results => {

          for (let i = 0; i < results.length; i++) {
            if (results[i] != null) {

              let aux = new InfoAutorizarSpei();
              aux.banco = this.info[i].banco;
              aux.beneficiario = this.info[i].beneficiario;
              aux.claberastreo = this.info[i].claberastreo;
              aux.conceptopago = this.info[i].conceptopago;
              aux.destino = this.info[i].destino;
              aux.estatus = true;
              aux.id = this.info[i].id;
              aux.monto = this.info[i].monto;
              aux.numerodecuenta = this.info[i].numerodecuenta;
              aux.pblu = this.info[i].pblu;
              aux.refnumerica = this.info[i].refnumerica;

              this.infoPagosService.actualizarPagados(aux).subscribe(() => {
                this.aver = this.aver.filter(item => item.id !== aux.id);
                this.dataSource = new MatTableDataSource<InfoAutorizarSpei>(this.aver);
                this.dataSource.paginator = this.paginator;

              });
              this.openSnackBar('Pago realizado', 'Aviso');
            } else if (results[i] == null) {
              this.listaErroSpei.push(this.info[i]);
            }
          }
        }, () => {
          this.openSnackBar('Error al generar la operación, Intente nuevamente', 'Aviso');
        });

      }
      this.mostrarSpinner = false;

    }, () => {
      this.openSnackBar('Error codigo OTP, Intente de nuevo', 'Aviso');
    });

  }


  openDiaCuenta(listaErroSpeei: InfoAutorizarSpei[]) {//abre el dialgo para ver las cuentas erroneas
    const dialogConfig = new MatDialogConfig();
    let lista = listaErroSpeei;
    dialogConfig.data = lista;
    dialogConfig.width = '50%'; // establece el ancho del diálogo al 50% del ancho de la pantalla
    dialogConfig.height = 'auto'; // establece la altura del diálogo al 50% del alto de la pantalla
    dialogConfig.maxWidth = '50%'; // establece el ancho máximo del diálogo al 90% del ancho de la pantalla
    dialogConfig.maxHeight = 'auto'; // establece la altura máxima del diálogo al 90% del alto de la pantalla
    dialogConfig.disableClose = false; // desactiva la opción de cerrar el diálogo haciendo clic fuera de él
    this.dialog.open(DialogErrorListPagoComponent, dialogConfig);
  }

  esFilaConError(row: any): boolean {//Aqui pinta las cuentas con error en la tabla
    if (this.listaErroSpei.includes(row)) {
      return true;
    }
    return false
  }
  openSnackBar(da1: string, da2: string) {//snakBar que se abre cuando se manda a llamar 
    this._snackBar.open(da1, da2, {
      duration: 6000,
    });
  }
}
