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
import { Param_Config_EiYu } from 'src/app/_model/Param_Config_EiYu';

interface Datos {
  Bandera: boolean;
  Archivo: string;
  Fecha: string;
  Datos: InfoCapturaSPEIPago[];
  DatosSPEI: InfoSpei;
}

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
  clabeMadre: string = '';
  claveDeRastreo: string = '';
  montoTotal!: number; //total del monto de todos los  datos
  nombreArchivo!: string; //nombre del archivo
  fechaDeCreacion: string = new Date().toLocaleDateString(); //fecha de creacion del archivo
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
  numeroDeCuenta: string = "";
  paramConfig !: Param_Config_EiYu;


  constructor(
    private loginServices: InfoLoginService,
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
      this.nombreArchivo = this.localStorageService.getData('nombreArchivo');
      this.dataSource = new MatTableDataSource(this.envioMazivo);
      setTimeout(() => { this.dataSource.paginator = this.paginator; this.dataSource.sort = this.sort; });
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
  parametroCuentaConcentradora() {
    let pblu = { peiyu: this.localStorageService.getUsuario("pblu") }
    this.infoCuentaClabeService.parametrosCuentaConcentradora(pblu).subscribe((dato: Param_Config_EiYu) => {
      this.paramConfig = dato;
    })
  }
  ngOnInit(): void {
    this.montoTotal = 0;
    if (this.localStorageService.getExcelList('listExel') != null) {
      this.envioMazivo = this.localStorageService.getExcelList('listExel');
      this.nombreArchivo = this.localStorageService.getData('nombreArchivo');
      this.dataSource = new MatTableDataSource(this.envioMazivo);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.divEscondido = false;
    } else {
      this.dataSource = new MatTableDataSource(this.envioMazivo);
    }
    for (let m of this.envioMazivo) {
      this.montoTotal = this.montoTotal + parseFloat(m.monto);
    }
  }

  async busquedaCuentaConcentradora() {
    let res = { peiyu: this.localStorageService.getUsuario('pblu') };
    try {
      const data = await this.infoCuentaClabeService.buscarPbluConCuenta(res).toPromise();
      let clabe = {
        "clabe": data.clabe_pblu,
        "pblu": this.localStorageService.getUsuario("pblu")
      };
      const d = await this.infoCuentaClabeService.buscarCuentaExiste(clabe).toPromise();

      if (d != null) {
        this.clabeMadre = d.clabe;
      } else {
        this.clabeMadre = "";
      }

      return this.clabeMadre;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  generadorDeClave(): string {
    let request = new requesteClaveRastreo();
    request.idParticipante = this.localStorageService
      .getUsuario('pblu')
      .toString();
    this.infoBancoService
      .generarClaveRastreo(request)
      .pipe(
        finalize(() => {
          return this.claveDeRastreo;
        })
      )
      .subscribe((data: { claveRastreo: string }) => {
        this.claveDeRastreo = data.claveRastreo;
      });
    return 'XXXXXXXXXXXXXXXXX';
  }

  async cargarArchivo2(event: Event) {
    const clabeMadre = await this.busquedaCuentaConcentradora();
    this.montoTotal = 0;
    this.envioMazivo = [];
    this.localStorageService.removeExecel();
    this.localStorageService.removeData('nombreArchivo');
    this.ngAfterViewInit();
    const inputElement = event.target as HTMLInputElement;
    let archivo = inputElement.files;
    let flag = false;
    if (archivo != null) {
      this.nombreArchivo = archivo[0].name;
      this.envioMazivo = [];
      this.dataSource = new MatTableDataSource(this.envioMazivo);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      const lector = new FileReader();
      lector.readAsBinaryString(archivo[0]);
      this.cd.detectChanges();
      lector.onload = async () => {
        const libro = XLSX.read(lector.result, { type: 'binary' });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        this.datos = XLSX.utils.sheet_to_json(hoja);
        let aux = 0;
        for (const element of this.datos) {
          aux++;
          if (
            element['Destino'] &&
            element['Nombre Beneficiario'] &&
            element['Numero de cuenta'] &&
            element['Institucion bancaria'] &&
            element['Monto'] &&
            element['Referencia Numerica'] &&
            element['Concepto pago']
          ) {
            let trans = new InfoCapturaSPEIPago();
            trans.ctaDestino = element['Destino'];

            if (
              trans.ctaDestino.toString().length == 18 &&
              this.validarSoloNumeros(element['Destino'])
            ) {
              if (element['Destino'] != element['Numero de cuenta']) {
                trans.ctaDestino = element['Destino'];
              } else {
                this.divEscondido = true;
                flag = true;
                this.snackBar.open(
                  'Carga interrumpida: Cuenta destino no puede ser igual a la clabe, favor de verificar documento.',
                  'Cerrar',
                  { duration: 3000 }
                );
                break;
              }
            } else {
              this.divEscondido = true;
              flag = true;
              this.snackBar.open(
                'Carga interrumpida: Cuenta destino no es valida, favor de verificar documento.',
                'Cerrar',
                { duration: 3000 }
              );
              break;
            }
            trans.nombreDestino = element['Nombre Beneficiario'];

            trans.clabe = element['Numero de cuenta'];

            if (this.clabeMadre === this.numeroDeCuenta.toString().trim()) {
              if (this.paramConfig.valor == 1) {
                if (
                  trans.clabe.toString().length == 18 &&
                  this.validarSoloNumeros(element['Numero de cuenta'])
                ) {
                  trans.clabe = element['Numero de cuenta'];
                } else {
                  this.divEscondido = true;
                  flag = true;
                  this.snackBar.open(
                    'Carga interrumpida: Numero de cuenta no es valida, favor de verificar documento.',
                    'Cerrar',
                    { duration: 3000 }
                  );
                  break;
                }
              }else{
                this.divEscondido = true;
                flag = true;
                this.snackBar.open(
                  'Carga interrumpida: No se puede realizar el SPEI desde una cuenta concentradora, favor de verificar documento.',
                  'Cerrar',
                  { duration: 3000 }
                );
                break;
              }
            }else{
              if (
                trans.clabe.toString().length == 18 &&
                this.validarSoloNumeros(element['Numero de cuenta'])
              ) {
                trans.clabe = element['Numero de cuenta'];
              } else {
                this.divEscondido = true;
                flag = true;
                this.snackBar.open(
                  'Carga interrumpida: Numero de cuenta no es valida, favor de verificar documento.',
                  'Cerrar',
                  { duration: 3000 }
                );
                break;
              }
            }
            trans.bancoDestino = element['Institucion bancaria'];

            trans.monto = element['Monto'];
            if (
              this.validarSoloNumeros(element['Monto']) &&
              trans.monto.toString().length > 0
            ) {
              trans.monto = element['Monto'];
            } else {
              this.divEscondido = true;
              flag = true;
              this.snackBar.open(
                'Carga interrumpida: Monto debe ser mayor a 0, favor de verificar documento.',
                'Cerrar',
                { duration: 3000 }
              );
              break;
            }

            trans.refNum = element['Referencia Numerica'];
            if (
              this.validarSoloNumeros(trans.refNum) &&
              trans.refNum.toString().length > 0 &&
              trans.refNum.toString().length < 8
            ) {
              trans.refNum = element['Referencia Numerica'];
            } else {
              this.divEscondido = true;
              flag = true;
              this.snackBar.open(
                'Carga interrumpida: Referencia Númerica debe tener mínimo 1 dígito y máximo 7 dígitos, favor de verificar documento.',
                'Cerrar',
                { duration: 3000 }
              );
              break;
            }
            trans.conceptoPago = element['Concepto pago'];
            this.envioMazivo.push(trans);
          } else {
            this.divEscondido = true;
            flag = true;
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
          this.localStorageService.setData('nombreArchivo', this.nombreArchivo);
          this.ngAfterViewInit();
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
        this.localStorageService.removeData('nombreArchivo');
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
          const datos: Datos = {
            Bandera: true,
            Archivo: this.nombreArchivo,
            Fecha: this.fechaDeCreacion,
            Datos: this.envioMazivo,
            DatosSPEI: InfSpei,
          }
          this.dialogRef.close(datos);
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
