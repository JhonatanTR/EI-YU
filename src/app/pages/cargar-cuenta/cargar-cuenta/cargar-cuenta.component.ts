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
import { catchError, finalize, of } from 'rxjs';
import { persona } from '../../../_modelRequest/modeloCuenta/persona';
import { domicilio } from 'src/app/_modelRequest/modeloCuenta/domicilio';
import { perfil } from 'src/app/_modelRequest/modeloCuenta/perfil';
import { CargarCuentaCreateDialogComponent } from '../cargar-cuenta-create-dialog/cargar-cuenta-create-dialog.component';
import { AccountRefrerenceService } from 'src/app/_service/account-refrerence.service';
import * as FileSaver from 'file-saver';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-cargar-cuenta',
  templateUrl: './cargar-cuenta.component.html',
  styleUrls: ['./cargar-cuenta.component.css'],
})
export class CargarCuentaComponent implements OnInit {
  datosExcel: InfoPersonaFisica[] = [];
  datos: any[] = []; //datos que trae el excel
  selection = new SelectionModel<InfoPersonaFisica>(true, []);
  selecc: InfoPersonaFisica[] = []; //Es un auxiliar
  deseleccionados: InfoPersonaFisica[] = []; //Los datos deseleecionados
  codigoOTP: string = '';
  arregloPersonas: object[] = [];
  primeraCasillaSeleccionada = false; //La casilla principal es selecciona o no
  creados: boolean = false;
  cuentasCreadas: number = 0;
  cuentasNoCreadas: number = 0;
  option: boolean = false;
  divEscondido: boolean = true; //la variable del div que contiene la tabla de los datos del excel
  displayedColumns: string[] = [
    'select',
    'ID',
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
  ) { }

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
    } else {
      this.divEscondido = true;
    }
  }
  eliminar() {
    console.log(this.selecc);
    for (let i = 0; i < this.datosExcel.length; i++) {
      for (let j = 0; j < this.selecc.length; j++) {
        if (this.datosExcel[i].id === this.selecc[j].id) {
          this.datosExcel.splice(i, 1);
        }
      }
    }
    console.log(this.datosExcel);
    this.localStorageService.setExcel('datosExcel', this.datosExcel);
    this.ngAfterViewInit();
    this.selecc = [];
    this.selection = new SelectionModel<InfoPersonaFisica>(true, []);
  }
  cargarXLSX(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let archivo = inputElement.files;
    let flag = false;
    if (archivo != null) {
      this.datosExcel = [];
      const lector = new FileReader();
      lector.readAsBinaryString(archivo[0]);
      lector.onload = () => {
        const libro = XLSX.read(lector.result, { type: 'binary' });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        this.datos = XLSX.utils.sheet_to_json(hoja);
        let aux = 0;
        for (let i = 0; i < this.datos.length; i++) {
          aux++;
          if (
            this.datos[i]['correo'] &&
            this.datos[i]['telefono'] &&
            this.datos[i]['nombre'] &&
            this.datos[i]['idOcupacion'] &&
            this.datos[i]['celular'] &&
            this.datos[i]['entidadNacimiento'] &&
            this.datos[i]['numIdentificacionOf'] &&
            this.datos[i]['apellidoPaterno'] &&
            this.datos[i]['apellidoMaterno'] &&
            this.datos[i]['numIdentificacionOf'] &&
            this.datos[i]['rfc'] &&
            this.datos[i]['callePrincipal'] &&
            this.datos[i]['numExterior'] &&
            this.datos[i]['numInterior'] &&
            this.datos[i]['colonia'] &&
            this.datos[i]['codPostal'] &&
            this.datos[i]['fechaNacimiento']
          ) {
            let dataPersona = new InfoPersonaFisica();
            dataPersona.id = aux;
            dataPersona.correo = this.datos[i]['correo'];
            dataPersona.telefono = this.datos[i]['telefono'];
            dataPersona.nombre = this.datos[i]['nombre'];
            dataPersona.idOcupacion = this.datos[i]['idOcupacion'];
            dataPersona.celular = this.datos[i]['celular'];
            dataPersona.sexo = this.datos[i]['sexo'];
            dataPersona.entidadNacimiento = this.datos[i]['entidadNacimiento'];
            dataPersona.apellidoPaterno = this.datos[i]['apellidoPaterno'];
            dataPersona.apellidoMaterno = this.datos[i]['apellidoMaterno'];
            dataPersona.numIdentificacionOf = this.datos[i]['numIdentificacionOf'];
            dataPersona.rfc = this.datos[i]['rfc'];
            dataPersona.curp = this.datos[i]['curp'];
            dataPersona.callePrincipal = this.datos[i]['callePrincipal'];
            dataPersona.numExterior = this.datos[i]['numExterior'];
            dataPersona.numInterior = this.datos[i]['numInterior'];
            dataPersona.colonia = this.datos[i]['colonia'];
            dataPersona.codPostal = this.datos[i]['codPostal'];
            dataPersona.fechaNacimiento = this.datos[i]['fechaNacimiento'];
            this.datosExcel.push(dataPersona);
          } else {
            flag = true;
            this.divEscondido = true;
            this.datos = [];
            this.snackBar.open(
              'Carga interrumpida: Campos incompletos, favor de verificar documento.',
              'Cerrar'
            );
          }
        }
        if (!flag) {
          this.localStorageService.setExcel('datosExcel', this.datosExcel);
          this.divEscondido = false;
          this.cuentasCreadas = 0;
          this.cuentasNoCreadas = 0;
          this.creados = false;
          this.ngAfterViewInit();
        }
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
        this.creados = false;
        this.cuentasCreadas = 0;
        this.cuentasNoCreadas = 0;
        this.snackBar.open('Cuentas Removidas', 'Cerrar', {
          duration: 2000,
        });
      } else {
        this.divEscondido = false;
      }
    });
  }
  auxExcelLista: InfoPersonaFisica[] = [];
  createAccounts() {
    if (this.codigoOTP != '') {
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
            this.snackBar.open('Error codigo OTP, Intente de nuevo', 'Cerrar', {
              duration: 2000,
            });
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
              let contador =0;
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
                p.numIdentificacionOf =this.datosExcel[i].numIdentificacionOf;
                p.idNacionalidad = 1;
                p.idPaisNac = 117;
                p.serieFirmaElect = 'xxxxx';
                p.tipoIdentificacionOf = 1;
                p.rfc = this.datosExcel[i].rfc;
                p.curp = this.datosExcel[i].curp;
                d.callePrincipal = this.datosExcel[i].callePrincipal;
                d.numExterior = this.datosExcel[i].numExterior;
                d.numInterior = this.datosExcel[i].numInterior;
                d.colonia = this.datosExcel[i].colonia;
                d.codPostal = this.datosExcel[i].codPostal;
                p.fechaNacimiento = this.datosExcel[i].fechaNacimiento;
                req.comprobantes = [];
                req.persona = p;
                req.domicilio = d;
                req.perfil = perf;
                const cuentserv = this.cuentaService
                  .crearCuenta(req).subscribe(
                  (data) => {
                    if (data!=null || data?.ok!=false) {
                    this.cuentasCreadas++;
                    this.datosExcel[i].estatus = 'CREADA';
                    this.datosExcel[i].clabe = data.mensaje;
                    console.log(data.mensaje);
                    this.snackBar.open(
                      'Cuenta creada.',
                      'Cerrar'
                    )
                  }},
                  (error) => {
                    console.log(error)
                  this.datosExcel[i].estatus = 'ERROR';
                  this.datosExcel[i].clabe = 'N/A';
                  this.cuentasNoCreadas++;
                  this.snackBar.open(
                    'Error al crear cuentas, favor de verificar que los datos esten verificados correctamente en el documento XLSX.',
                    'Cerrar'
                  )}
                  )
                  cuentserv.add(() => {
                      contador++;
                    if(contador === this.datosExcel.length){
                      const workbook = XLSX.utils.book_new();
                      const worksheet = XLSX.utils.json_to_sheet(this.datosExcel);
                      XLSX.utils.book_append_sheet(
                        workbook,
                        worksheet,
                        'Datos de la tabla'
                      );
                      //Exportar la hoja de cálculo en formato Excel
                      const excelBuffer: any = XLSX.write(workbook, {
                        bookType: 'xlsx',
                        type: 'array',
                      });
                      const dataBlob: Blob = new Blob([excelBuffer], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      });
                      // Exportar la hoja de cálculo en formato Excel
                      this.creados = true;
                      FileSaver.saveAs(dataBlob, 'cuentas.xlsx');

                    }
                  });

              }
            } else {
              this.divEscondido = false;
            }
          });
          } else {
             this.codigoOTP = '';
           }
        });
    } else {
      this.myInput.nativeElement.focus();
      this.snackBar.open(
        'Es necesario ingresar el código OTP para continuar',
        'CERRAR',
        {
          duration: 2000,
        }
      );
    }
  }

  //Estos son metodos para que funcione los seleccionadores de la tabla
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.deseleccionados = [];
      this.selecc = [];
      return;
    }
    this.selection.select(...this.dataSource.data);
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: InfoPersonaFisica): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  chekeador(row: InfoPersonaFisica) {
    //Chekea los que estan en la lista
    if (this.primeraCasillaSeleccionada) {
      return true;
    } else {
      for (let i = 0; i < this.selecc.length; i++) {
        if (row.id == this.selecc[i].id) {
          return true;
        }
      }
      return false;
    }
  }
  chekeador2(row: InfoPersonaFisica) {
    //Deschequea los que no estan chekeaos
    if (this.primeraCasillaSeleccionada) {
      for (let i = 0; i < this.deseleccionados.length; i++) {
        if (row.id == this.deseleccionados[i].id) {
          return false;
        }
      }
    }
    return true;
  }
  ver(row: InfoPersonaFisica) {
    //Este metodo realiza una seleccion dependiendo de la pagina en que este  Ya que si los datos deseleccionados estan
    //dentro de la tabla pues los mantenga deseleccionado
    if (this.primeraCasillaSeleccionada) {
      const index = this.deseleccionados.findIndex(
        (item) => item.id === row.id
      );
      if (index !== -1) {
        this.deseleccionados.splice(index, 1);
      } else {
        this.deseleccionados.push(row);
      }
    } else {
      const index = this.selecc.findIndex((item) => item.id === row.id);
      if (index !== -1) {
        this.selecc.splice(index, 1);
      } else {
        this.selecc.push(row);
      }
      this.deseleccionados = [];
    }
  }
}
