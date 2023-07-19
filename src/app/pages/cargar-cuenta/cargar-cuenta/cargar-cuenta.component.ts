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
  mostrarSpinner: boolean = false;
  divEscondido: boolean = true; //la variable del div que contiene la tabla de los datos del excel
  displayedColumns: string[] = [
    'select',
    'ID',
    'Correo',
    'Teléfono',
    'Nombre',
    'Celular',
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
    } else {
      this.divEscondido = true;
    }
  }
  eliminar() {
    console.log(this.selecc);
    console.log(this.deseleccionados);
    if (this.isAllSelected() != false) {
      this.removeXLSX();
    } else {
      if (this.selecc.length === 0) {
        this.datosExcel = this.datosExcel.filter((dato) => {
          // Comprueba si el id del dato está presente en this.deseleccionados
          return this.deseleccionados.some(
            (deseleccionado) => deseleccionado.id === dato.id
          );
        });
      } else {
        this.datosExcel = this.datosExcel.filter((dato) => {
          return !this.selecc.some((item) => item.id === dato.id);
        });
      }

      this.localStorageService.setExcel('datosExcel', this.datosExcel);
      this.ngAfterViewInit();
      this.selecc = [];
      this.selection = new SelectionModel<InfoPersonaFisica>(true, []);
    }
  }

  cargarXLSX(event: Event) {
    this.deseleccionados = [];
    this.selecc = [];
    this.datosExcel = [];
    this.primeraCasillaSeleccionada = false;
    this.selection = new SelectionModel<InfoPersonaFisica>(true, []);
    this.selection.clear;
    this.localStorageService.removeExcel();
    this.ngAfterViewInit();
    const inputElement = event.target as HTMLInputElement;
    let archivo = inputElement.files;
    let flag = false;
    if (archivo != null) {
      this.datosExcel = [];
      this.dataSource = new MatTableDataSource(this.datosExcel);
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
            this.datos[i]['nombre'] &&
            this.datos[i]['apellidoPaterno'] &&
            this.datos[i]['apellidoMaterno'] &&
            this.datos[i]['rfc'] &&
            this.datos[i]['curp'] &&
            this.datos[i]['callePrincipal'] &&
            this.datos[i]['numExterior'] &&
            this.datos[i]['numInterior'] &&
            this.datos[i]['colonia'] &&
            this.datos[i]['codPostal']
          ) {
            let dataPersona = new InfoPersonaFisica();
            dataPersona.id = aux;
            dataPersona.correo = this.datos[i]['correo'];
            dataPersona.telefono = this.datos[i]['telefono'];
            dataPersona.nombre = this.datos[i]['nombre'];
            dataPersona.idOcupacion = this.datos[i]['idOcupacion'];
            dataPersona.celular = this.datos[i]['celular'];
            dataPersona.entidadNacimiento = this.datos[i]['entidadNacimiento'];
            dataPersona.apellidoPaterno = this.datos[i]['apellidoPaterno'];
            dataPersona.apellidoMaterno = this.datos[i]['apellidoMaterno'];
            dataPersona.numIdentificacionOf =
              this.datos[i]['numIdentificacionOf'];
            dataPersona.rfc = this.datos[i]['rfc'];
            if (
              dataPersona.rfc.toString().length > 12 ||
              dataPersona.rfc.toString().length < 13
            ) {
              dataPersona.rfc = this.datos[i]['rfc'];
            } else {
              //Si el RFC no tiene mas de 12 o 13 digitos, salte del ciclo y no agregue el registro
              flag = true;
              this.divEscondido = true;
              this.cuentasCreadas = 0;
              this.cuentasNoCreadas = 0;
              this.snackBar.open(
                `Carga interrumpida: RFC de la fila ${aux} no válido, favor de verificar documento.`,
                'Cerrar'
              );
            }
            dataPersona.curp = this.datos[i]['curp'];
            if (dataPersona.curp.toString().length === 18) {
              dataPersona.curp = this.datos[i]['curp'];
            } else {
              //Si el CURP no tiene 18 digitos, salte del ciclo y no agregue el registro
              flag = true;
              this.divEscondido = true;
              this.cuentasCreadas = 0;
              this.cuentasNoCreadas = 0;
              this.snackBar.open(
                `Carga interrumpida: CURP de la fila ${aux} no válido, favor de verificar documento.`,
                'Cerrar'
              );
            }
            dataPersona.sexo = dataPersona.curp.charAt(10).toUpperCase();
            if (dataPersona.sexo === 'H') {
              dataPersona.sexo = 'M';
            } else if (dataPersona.sexo === 'M') {
              dataPersona.sexo = 'F';
            }
            dataPersona.callePrincipal = this.datos[i]['callePrincipal'];
            dataPersona.numExterior = this.datos[i]['numExterior'];
            dataPersona.numInterior = this.datos[i]['numInterior'];
            dataPersona.colonia = this.datos[i]['colonia'];
            dataPersona.codPostal = this.datos[i]['codPostal'];
            if (dataPersona.codPostal.toString().length === 5) {
              dataPersona.codPostal = this.datos[i]['codPostal'];
            } else {
              //Si el Código Postal no tiene 5 digitos, salte del ciclo y no agregue el registro
              flag = true;
              this.divEscondido = true;
              this.cuentasCreadas = 0;
              this.cuentasNoCreadas = 0;
              this.snackBar.open(
                `Carga interrumpida: Código Postal de la fila ${aux} no válido, favor de verificar documento.`,
                'Cerrar',
                { duration: 3000 }
              );
            }
            dataPersona.fechaNacimiento = this.datos[i]['fechaNacimiento'];
            dataPersona.fechaNacimiento = this.convertirNumeroAStrFecha(
              parseInt(dataPersona.fechaNacimiento)
            );
            this.datosExcel.push(dataPersona);
          } else {
            flag = true;
            this.divEscondido = true;
            this.cuentasCreadas = 0;
            this.cuentasNoCreadas = 0;
            this.datos = [];
            this.snackBar.open(
              'Carga interrumpida: Campos incompletos, favor de verificar documento.',
              'Cerrar',
              { duration: 3000 }
            );
          }
        }
        if (this.datos.length === 0) {
          flag = true;
          this.divEscondido = true;
          this.cuentasCreadas = 0;
          this.cuentasNoCreadas = 0;
          this.datos = [];
          this.snackBar.open(
            'Carga interrumpida: Archivo sin datos, favor de verificar documento.',
            'Cerrar',
            { duration: 3000 }
          );
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
  convertirNumeroAStrFecha(numero: number): string {
    const fecha = new Date((numero - 25569) * 86400 * 1000);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear().toString();
    return `${mes}/${dia}/${anio}`;
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
        this.deseleccionados = [];
        this.datosExcel = [];
        this.primeraCasillaSeleccionada = false;
        this.selection = new SelectionModel<InfoPersonaFisica>(true, []);
        this.selection.clear;
        this.localStorageService.removeExcel();
        this.ngAfterViewInit();
        this.creados = false;
        this.cuentasCreadas = 0;
        this.cuentasNoCreadas = 0;
        this.snackBar.open('Cuentas Removidas', 'Cerrar', {
          duration: 2000,
        });
      } else {
        this.primeraCasillaSeleccionada = true;
        this.divEscondido = false;
      }
    });
  }
  auxExcelLista: InfoPersonaFisica[] = [];
  requestList: requestPersonaFisica[] = [];
  createAccounts() {
    this.requestList = [];
    this.cuentasCreadas = 0;
    this.cuentasNoCreadas = 0;
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

                  let correo = this.datosExcel[i].correo;
                  if (correo == null || correo == undefined || correo == '') {
                    p.correo = 'xxxxx@xxx.com';
                  } else {
                    p.correo = this.datosExcel[i].correo;
                  }
                  let telefono = this.datosExcel[i].telefono;
                  if (
                    telefono == null ||
                    telefono == undefined ||
                    telefono == ''
                  ) {
                    p.telefono = 'xxxxxxxxxx';
                  } else {
                    p.telefono = this.datosExcel[i].telefono;
                  }
                  p.nombre = this.datosExcel[i].nombre;
                  let celular = this.datosExcel[i].celular;
                  if (
                    celular == null ||
                    celular == undefined ||
                    celular == ''
                  ) {
                    p.celular = 'xxxxxxxxxx';
                  } else {
                    p.celular = this.datosExcel[i].celular;
                  }
                  let idOcupacion = this.datosExcel[i].idOcupacion;
                  if (idOcupacion == null || idOcupacion == undefined) {
                    p.idOcupacion = 0;
                  } else {
                    p.idOcupacion = this.datosExcel[i].idOcupacion;
                  }
                  p.sexo = this.datosExcel[i].sexo;
                  let entidadNacimiento = this.datosExcel[i].entidadNacimiento;
                  if (
                    entidadNacimiento == null ||
                    entidadNacimiento == undefined
                  ) {
                    p.entidadNacimiento = 0;
                  } else {
                    p.entidadNacimiento = this.datosExcel[i].entidadNacimiento;
                  }
                  p.apellidoPaterno = this.datosExcel[i].apellidoPaterno;
                  p.apellidoMaterno = this.datosExcel[i].apellidoMaterno;
                  let numIdentificacionOf =
                    this.datosExcel[i].numIdentificacionOf;
                  if (
                    numIdentificacionOf == null ||
                    numIdentificacionOf == undefined ||
                    numIdentificacionOf == ''
                  ) {
                    p.numIdentificacionOf = 'xxxxx';
                  } else {
                    p.numIdentificacionOf =
                      this.datosExcel[i].numIdentificacionOf;
                  }
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
                  let fechaNacimiento = this.datosExcel[i].fechaNacimiento;
                  if (
                    fechaNacimiento == null ||
                    fechaNacimiento == undefined ||
                    fechaNacimiento == ''
                  ) {
                    p.fechaNacimiento = 'xx/xx/xxxx';
                  } else {
                    p.fechaNacimiento = this.datosExcel[i].fechaNacimiento;
                  }
                  req.comprobantes = [];
                  req.persona = p;
                  req.domicilio = d;
                  req.perfil = perf;
                  this.requestList.push(req);
                }
                this.cuentaService
                  .crearCuenta(this.requestList)
                  .pipe(
                    finalize(() => {
                      //Fin de la animacion
                      this.mostrarSpinner = false;
                      // Este bloque se ejecutará al final de la suscripción, una vez que se completen todas las solicitudes.
                    })
                  )
                  .subscribe(
                    (data) => {
                      // Este bloque se ejecutará si la solicitud se completa sin errores.
                      this.generarExcel(this.datosExcel, data);
                      // Aquí puedes realizar acciones con la respuesta exitosa si es necesario.
                    },
                    (error) => {
                      // Este bloque se ejecutará si ocurre un error durante la solicitud.
                      console.error('Error en la solicitud:', error);
                      // Aquí puedes realizar acciones para manejar el error, si es necesario.
                      // También puedes dejar este bloque vacío si no deseas hacer nada con el error y permitir que el flujo continúe normalmente.
                    }
                  );
              } else {
                this.divEscondido = false;
              }
            });
          } else {
            this.codigoOTP = '';
            this.mostrarSpinner = false;
          }
        });
    } else {
      this.myInput.nativeElement.focus();
      this.snackBar.open(
        'Es necesario ingresar el código OTP para continuar',
        'Cerrar',
        {
          duration: 2000,
        }
      );
    }
  }
  generarExcel(excelDeSubida: InfoPersonaFisica[], cuentasCreadas: any[]) {
    let execlAux: InfoPersonaFisica[] = [];
    for (let i = 0; i < excelDeSubida.length; i++) {
      let execlAux2 = new InfoPersonaFisica();
      if (cuentasCreadas[i]?.ok == true) {
        this.cuentasCreadas++;
        execlAux2.clabe = cuentasCreadas[i].mensaje;
        execlAux2.estatus = 'CREADO';
      } else if (cuentasCreadas[i]?.ok == false) {
        this.cuentasNoCreadas++;
        const responseText: string = cuentasCreadas[i].response;
        const responseJson = JSON.parse(responseText);
        const mensaje: string = responseJson.mensaje;
        execlAux2.clabe = 'N/A';
        if (mensaje != null) {
          execlAux2.estatus = mensaje;
        } else {
          execlAux2.estatus = 'ERROR AL CREAR LA CUENTA';
        }
      }
      execlAux2.id = excelDeSubida[i].id;
      execlAux2.telefono = excelDeSubida[i].telefono;
      execlAux2.apellidoMaterno = excelDeSubida[i].apellidoMaterno;
      execlAux2.apellidoPaterno = excelDeSubida[i].apellidoPaterno;
      execlAux2.callePrincipal = excelDeSubida[i].callePrincipal;
      execlAux2.celular = excelDeSubida[i].celular;
      execlAux2.codPostal = excelDeSubida[i].codPostal;
      execlAux2.colonia = excelDeSubida[i].colonia;
      execlAux2.correo = excelDeSubida[i].correo;
      execlAux2.curp = excelDeSubida[i].curp;
      execlAux2.entidadNacimiento = excelDeSubida[i].entidadNacimiento;
      execlAux2.fechaNacimiento = excelDeSubida[i].fechaNacimiento;
      execlAux2.idOcupacion = excelDeSubida[i].idOcupacion;
      execlAux2.nombre = excelDeSubida[i].nombre;
      execlAux2.numExterior = excelDeSubida[i].numExterior;
      execlAux2.numIdentificacionOf = excelDeSubida[i].numIdentificacionOf;
      execlAux2.numInterior = excelDeSubida[i].numInterior;
      execlAux2.rfc = excelDeSubida[i].rfc;
      execlAux2.sexo = excelDeSubida[i].sexo;
      execlAux2.telefono = excelDeSubida[i].telefono;
      execlAux.push(execlAux2);
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(execlAux);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cuentas Generadas');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const dataBlob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    FileSaver.saveAs(dataBlob, 'cuentas_generadas.xlsx');
    this.creados = true;
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
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.id + 1
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
