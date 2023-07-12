import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InfoPersonaFisica } from 'src/app/_model/InfoPersonaFisica';
import { InfoSpei } from 'src/app/_model/InfoSpei';
import { requestOtp } from 'src/app/_modelRequest/requestOtp';
import { requestPersonaFisica } from 'src/app/_modelRequest/modeloCuenta/requestPersonaFisica';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import * as XLSX from 'xlsx';
import { CargarCuentaRemoveDialogComponent } from '../cargar-cuenta-remove-dialog/cargar-cuenta-remove-dialog.component';
import { InfoLoginService } from 'src/app/_service/info-login.service';
import { catchError, of } from 'rxjs';
import { persona } from '../../../_modelRequest/modeloCuenta/persona';
import { domicilio } from 'src/app/_modelRequest/modeloCuenta/domicilio';
import { perfil } from 'src/app/_modelRequest/modeloCuenta/perfil';
import { CargarCuentaCreateDialogComponent } from '../cargar-cuenta-create-dialog/cargar-cuenta-create-dialog.component';
import { AccountRefrerenceService } from 'src/app/_service/account-refrerence.service';

@Component({
  selector: 'app-cargar-cuenta',
  templateUrl: './cargar-cuenta.component.html',
  styleUrls: ['./cargar-cuenta.component.css'],
})
export class CargarCuentaComponent implements OnInit {
  datosExcel: InfoPersonaFisica[] = [];
  datos: any[] = []; //datos que trae el excel
  codigoOTP: string = '';
  arregloPersonas: object[] = [];
  option: boolean = false;
  divEscondido: boolean = true; //la variable del div que contiene la tabla de los datos del excel
  displayedColumns: string[] = [
    'Correo',
    'Teléfono',
    'Nombre',
    'ID Ocupación',
    'Sexo',
    'Entidad de Nacimiento',
    'Apellido Paterno',
    'Apellido Materno',
    'Num. Identificación O.F.',
    'RFC',
    'CURP',
    'Calle Principal',
    'Num. Exterior',
    'Num. Interior',
    'Colonia',
    'Código Postal',
    'Fecha de Nacimiento',
  ];
  dataSource!: MatTableDataSource<InfoPersonaFisica>;
  @ViewChild('myInput') myInput!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    //private dialogRef: MatDialogRef<DialogoConfUdnComponent>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private loginServices: InfoLoginService,
    private localStorageService: LocalStorageService,
    private cuentaService: AccountRefrerenceService
  ) {}

  ngOnInit(): void {
    if (this.localStorageService.getExcel('datosExcel') != null) {
      this.datosExcel = this.localStorageService.getExcel('datosExcel');
      this.dataSource = new MatTableDataSource(this.datosExcel);
      this.dataSource.paginator = this.paginator;
      this.divEscondido = false;
    } else {
      this.dataSource = new MatTableDataSource(this.datosExcel);
    }
  }

  ngAfterViewInit() {
    if (this.localStorageService.getExcel('datosExcel') != null) {
      this.datosExcel = this.localStorageService.getExcel('datosExcel');
      this.dataSource = new MatTableDataSource(this.datosExcel);
      this.dataSource.paginator = this.paginator;
      this.divEscondido = false;
      console.log(this.datosExcel);
      /*for (let m of this.datosExcel) {
      this.montoTotal = this.montoTotal + parseFloat(m.monto);
    }*/
    } else {
      this.divEscondido = true;
    }
  }
  cargarXLSX(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let archivo = inputElement.files;
    if (archivo != null) {
      this.datosExcel = [];
      const lector = new FileReader();
      lector.readAsBinaryString(archivo[0]);
      lector.onload = () => {
        const libro = XLSX.read(lector.result, { type: 'binary' });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        this.datos = XLSX.utils.sheet_to_json(hoja);
        for (const element of this.datos) {
          if (
            element['correo'] &&
            element['telefono'] &&
            element['idOcupacion'] &&
            element['celular'] &&
            element['entidadNacimiento'] &&
            element['numIdentificacionOf']
          ) {
            let dataPersona = new InfoPersonaFisica();
            dataPersona.correo = element['correo'];
            dataPersona.telefono = element['telefono'];
            dataPersona.nombre = element['nombre'];
            dataPersona.idOcupacion = element['idOcupacion'];
            dataPersona.celular = element['celular']
            dataPersona.sexo = element['sexo'];
            dataPersona.entidadNacimiento = element['entidadNacimiento'];
            dataPersona.apellidoPaterno = element['apellidoPaterno'];
            dataPersona.apellidoMaterno = element['apellidoMaterno'];
            dataPersona.numIdentificacionOf = element['numIdentificacionOf'];
            dataPersona.rfc = element['rfc'];
            dataPersona.curp = element['curp'];
            dataPersona.callePrincipal = element['callePrincipal'];
            dataPersona.numExterior = element['numExterior'];
            dataPersona.numInterior = element['numInterior'];
            dataPersona.colonia = element['colonia'];
            dataPersona.codPostal = element['codPostal'];
            dataPersona.fechaNacimiento = element['fechaNacimiento'];
            this.datosExcel.push(dataPersona);
          }
        }
        this.localStorageService.setExcel('datosExcel', this.datosExcel);
        this.divEscondido = false;
        this.ngAfterViewInit();
      };
    } else {
      this.divEscondido = true;
    }
  }

  removeXLSX() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.option;
    dialogConfig.width = '40%';
    dialogConfig.height = '40%';
    dialogConfig.disableClose = false;
    const dialogRef = this.dialog.open(
      CargarCuentaRemoveDialogComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.localStorageService.removeExcel();
        this.ngAfterViewInit();
        this.snackBar.open('Cuentas Removidas', 'Cerrar',
        {
          duration: 2000,
        });
      }else{
        this.divEscondido = false;
      }
    });
  }

  createAccounts() {
    this.codigoOTP = '';
    this.myInput.nativeElement.focus();
    this.snackBar.open(
      'Es necesario ingresar el código OTP para continuar',
      'CERRAR',
      {
        duration: 2000,
      }
    );
  }
  enviar() {
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
          this.snackBar.open('Error codigo OTP, Intente de nuevo', 'Aviso');
          return of(null);
        })
      )
      .subscribe((data) => {
        if (data?.mensaje == 'Otp validado correctamente') {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = this.arregloPersonas;
          dialogConfig.width = '40%';
          dialogConfig.height = '40%';
          dialogConfig.disableClose = false;
          const dialogRef = this.dialog.open(
            CargarCuentaCreateDialogComponent,
            dialogConfig
          );
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              for (let i = 0; i < this.datosExcel.length; i++) {
                let req = new requestPersonaFisica();
                let p = new persona();
                let d = new domicilio();
                let perf = new perfil();
                req.certificado = InfSpei.certificado;
                req.llave = InfSpei.llave;
                req.phrase = InfSpei.phrase;
                req.token = token;
                req.pblu = pblu;
                req.udnId = 0;
                req.nivel_cuenta = 1;
                p.correo = this.datosExcel[i].correo;
                p.telefono = this.datosExcel[i].telefono;
                p.nombre = this.datosExcel[i].nombre;
                p.celular = this.datosExcel[i].celular;
                p.idOcupacion = this.datosExcel[i].idOcupacion;
                p.sexo = this.datosExcel[i].sexo;
                p.entidadNacimiento = this.datosExcel[i].entidadNacimiento;
                p.apellidoPaterno = this.datosExcel[i].apellidoPaterno;
                p.apellidoMaterno = this.datosExcel[i].apellidoMaterno;
                p.numIdentificacionOf = this.datosExcel[i].numIdentificacionOf;
                p.rfc = this.datosExcel[i].rfc;
                p.curp = this.datosExcel[i].curp;
                d.callePrincipal = this.datosExcel[i].callePrincipal;
                d.numExterior = this.datosExcel[i].numExterior;
                d.numInterior = this.datosExcel[i].numInterior;
                d.colonia = this.datosExcel[i].colonia;
                d.codPostal = this.datosExcel[i].codPostal;
                p.fechaNacimiento = this.datosExcel[i].fechaNacimiento;
                req.persona = p;
                req.domicilio = d;
                req.perfil = perf;
                this.cuentaService.crearCuenta(req).pipe(
                  catchError((error) => {
                    this.snackBar.open('Error al generar la operación, Intente nuevamente', 'Cerrar');
                    // Aquí puedes realizar las acciones necesarias en caso de error
                    return of(null); // Devuelve un observable vacío o un valor por defecto en caso de error
                  })
                ).subscribe((data) => {
                  if (data) {
                    console.log(data.mensaje)
                    this.snackBar.open('Cuentas creadas', 'Cerrar',
                    {
                      duration: 2000,
                    });
                  }
                })
              }
            }else{
              this.divEscondido = false;
            }
          });
        } else {
          this.codigoOTP = '';
        }
      });
  }
}
