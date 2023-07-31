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
import { catchError, delay, of } from 'rxjs';
import { requestDatosTransferencias } from 'src/app/_modelRequest/requestdatosTransferencias';
import { InfoSpei } from 'src/app/_model/InfoSpei';
import { requestOtp } from 'src/app/_modelRequest/requestOtp';
import { InfoLoginService } from 'src/app/_service/info-login.service';
import { DialogoDialogCreateComponent } from './dialogo-dialog-create/dialogo-dialog-create.component';
import { InfoCuentaclabeService } from 'src/app/_service/info-cuentaclabe.service';
import { requesteClaveRastreo } from 'src/app/_modelRequest/requestClaveRastreo';
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
  infoBancoService: any;

  constructor(
    private loginService: LoginService,
    private dialogRef: MatDialogRef<DialogoComponent>,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private infoCuentaClabeService: InfoCuentaclabeService,
    private loginServices: InfoLoginService,
  ) {}

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
    this.infoBancoService.generarClaveRastreo(request).subscribe((data: { claveRastreo: string; }) => {
      console.log(data.claveRastreo)
      this.claveDeRastreo = data.claveRastreo;
      return this.claveDeRastreo;
    });
    return '';
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
            trans.ctaDestino = this.datos[i]['Destino'];
            if(trans.ctaDestino == this.datos[i]['Numero de cuenta'] && trans.ctaDestino.length == 18 && this.validarSoloNumeros(trans.ctaDestino)){
              this.snackBar.open(
                'Carga interrumpida: Cuenta destino no puede ser igual a la clabe, favor de verificar documento.',
                'Cerrar',
                { duration: 3000 }
              );
              break;
            }else{
              trans.ctaDestino = this.datos[i]['Destino'];
            }
            trans.nombreDestino = this.datos[i]['Nombre Beneficiario'];
            trans.clabe = this.datos[i]['Numero de cuenta'];
            if(trans.clabe.length == 18 && trans.clabe == this.clabeMadre && this.validarSoloNumeros(trans.clabe)){
              this.snackBar.open(
                'Carga interrumpida: La cuenta clabe pertenece a la cuenta concentradora, favor de verificar documento.',
                'Cerrar',
                { duration: 3000 }
              );
              break;
            }else{
              trans.clabe = this.datos[i]['Numero de cuenta'];
            }
            trans.bancoDestino = this.datos[i]['Institucion bancaria'];
            trans.monto = this.datos[i]['Monto'];
            if(parseFloat(trans.monto) <= 0.0 && this.validarSoloNumeros(trans.monto)){
              this.snackBar.open(
                'Carga interrumpida: Monto no puede ser cero, negativo o un caracter, favor de verificar documento.',
                'Cerrar',
                { duration: 3000 }
              );
              break;
            }else{
              trans.monto = this.datos[i]['Monto'];
            }
            trans.refNum = this.datos[i]['Referencia Numerica'];
            if(trans.refNum.length > 7 && trans.refNum.length < 1 && this.validarSoloNumeros(trans.refNum)){
              this.snackBar.open(
                'Carga interrumpida: Referencia Numerica debe tener al menos un digito númerico, o no ser mayor a 7 digitos, favor de verificar documento.',
                'Cerrar',
                { duration: 3000 }
              );
              break;
            }else{
              trans.refNum = this.datos[i]['Referencia Numerica'];
            }
            trans.conceptoPago = this.datos[i]['Concepto pago'];
            trans.cveRastreo = 'asw2';
            this.envioMazivo.push(trans);
          } else {
            this.snackBar.open(
              'Carga interrumpida: Campos incompletos, favor de verificar documento.',
              'Cerrar',
              { duration: 3000 }
            );
            break;
          }
        }
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

  requestList: requestDatosTransferencias[] = [];

  enviar() {
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

      this.loginServices
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
        .subscribe((data) => {
          this.mostrarSpinner = true;
          if (data?.mensaje == 'Otp validado correctamente') {
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
                  let req = new requestDatosTransferencias();

                  req.ctaDestino = this.envioMazivo[i].ctaDestino;
                  req.nombreDestino = this.envioMazivo[i].nombreDestino;
                  req.clabe = this.envioMazivo[i].clabe;
                  req.bancoDestino = this.envioMazivo[i].bancoDestino;
                  req.monto = this.envioMazivo[i].monto;
                  req.refNum = this.envioMazivo[i].refNum;
                  req.conceptoPago = this.envioMazivo[i].conceptoPago;
                  req.cveRastreo = this.generadorDeClave();
                  this.requestList.push(req);

                }
                console.log(this.requestList);
              }
            });
          }
        });
    }

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
