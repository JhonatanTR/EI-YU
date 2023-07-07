
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import 'jspdf-autotable';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BusquedaDialogComponent } from './busqueda-dialog/busqueda-dialog.component';
import { InfoBancosService } from 'src/app/_service/info-bancos.service';
import { RequestMovimientos } from 'src/app/_modelRequest/requestMoviento';
import { InfoMovimiento } from 'src/app/_model/InfoMovimiento';
import { MatPaginator } from '@angular/material/paginator';
import { InfoBancos } from 'src/app/_model/InfoBancos';
import { FormControl } from '@angular/forms';
import { catchError, finalize, map, of, startWith } from 'rxjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VerEstadoComponent } from './ver-estado/ver-estado.component';

@Component({
  selector: 'app-busqueda-movimiento',
  templateUrl: './busqueda-movimiento.component.html',
  styleUrls: ['./busqueda-movimiento.component.css']
})
export class BusquedaMovimientoComponent implements OnInit {
  listaMovimiento: InfoMovimiento[] = [];//Lista de movimiento realizado por x cliente
  dataSource!: MatTableDataSource<InfoMovimiento>;
  selection = new SelectionModel<InfoMovimiento>(true, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  selectAllPages = false;
  listaBancos: InfoBancos[] = []//lista de Bancos
  fechaActual!: Date;//Fecha actual
  claveDeRastreo: string = "";//Clave de rastreo aqui se almacenan
  institucionSeleccionada!: InfoBancos;
  tipoDeMovimiento: string = "";
  estatus: string = "";
  filteredBancos: any[] = [];//aqui se almacenan los filtros de banco
  filteredCuentas: any[] = [];//aqui se almacenan los filtros de las cuentas
  institucionControl = new FormControl();
  displayedColumns: string[] = ['select', 'Clave de rastreo', 'Concepto', 'Fecha de creacion', 'Tipo de movimiento','Monto', 'Institucióm', 'estatus', 'Opciones'];
  cantidad: number = 0;//es la cantidad de elementos de la consulta
  inicio!: Date;
  final!: Date;
  datos: string = "Cargo";
  tipos: Tipos[] = [{ value: "Cargo" }, { value: "Abono" }, { value: "Cargo por cierre" }, { value: "Abono por inicio" }]
  primeraCasillaSeleccionada = false;//La casilla principal es selecciona o no
  deseleccionados: InfoMovimiento[] = [];//Los datos deseleecionados
  selecc: InfoMovimiento[] = [];//Es un auxiliar
  @ViewChild('myInput') myInput!: ElementRef;
  datess = new InfoMovimiento();
  monto:string="0";
  maximaFecha!: Date;
  constructor(private _snackBar: MatSnackBar, private localStorageService: LocalStorageService, private dialog: MatDialog, private infoBancosService: InfoBancosService, private infoBancoService: InfoBancosService) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
    this.dataSource = new MatTableDataSource<InfoMovimiento>([]);
    this.fechaActual = new Date();
    this.institucionControl.setValue('');
    this.fechaActual = new Date();
    this.maximaFecha = new Date();
    this.maximaFecha.setDate(this.maximaFecha.getDate() + 3); // Agregar 1 día
  }
  onFechaInicioChange(event: MatDatepickerInputEvent<Date>): void {//Realiza un formato de la fecha
    const feche: any = event.value;
    const fechaFormateada = feche.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  }
  revisarValor() {
    if (!this.monto.trim()) {
      this.monto = "0";
    }
  }
  onFechaFinalChange(event: MatDatepickerInputEvent<Date>): void {
    const feche: any = event.value;
    const fechaFormateada = feche.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  }

  ngOnInit(): void {
    const datePipe = new DatePipe('en-US');
    let fin = new Date(this.fechaActual);
    fin.setDate(fin.getDate() + 1);
    let formattedDate = datePipe.transform(fin, 'yyyy-MM-dd');
    this.req.peiyu = this.localStorageService.getIdPblu("pblu");
    this.req.tipoMovimiento = "Cargo"
    this.req.fechaInicio = "2023-01-01"
    this.req.fechaFinal = formattedDate + "".trim();;
    this.infoBancosService.listarMovimientoFiltradosPageable(this.req, 0, 10)//realiza el primer filtrado de la pagina 0 con 10 elementos
      .pipe(
        finalize(() => {
          // Código a ejecutar al finalizar
        })
      ).pipe(
        catchError((error) => {
          this.openSnackBar('Se produjo un error de conexión. Por favor, inténtelo de nuevo más tarde.', 'Aviso');
          return of(null);
        }))
      .subscribe(data => {
        console.log(data)
        let mov = JSON.parse(JSON.stringify(data))?.content
        this.cantidad = JSON.parse(JSON.stringify(data))?.totalElements
        this.listaMovimiento = mov;
        this.dataSource = new MatTableDataSource<InfoMovimiento>(this.listaMovimiento);
        this.dataSource.paginator = this.paginator;
      });
    this.listarBanco();
  }
  pdfDisp(): boolean {//PDF:Aqui desabilita los campos dependiendo si la casilla principal esta seleccionada o si a seleccionado algun elemento de la tabla
    if (this.primeraCasillaSeleccionada === true || this.selecc.length > 0) {
      return false;
    }
    return true;
  }
  exDisp(): boolean {//EXCEL: Aqui desabilita los campos dependiendo si la casilla principal esta seleccionada o si a seleccionado algun elemento de la tabla
    if (this.primeraCasillaSeleccionada === true || this.selecc.length > 0) {
      return false;
    }
    return true;
  }
  opendialogo(infoMovimiento: any) {//Este metodo abre el modal para visualizar los detalles del abono o pago
    let infoMov = new InfoMovimiento();
    infoMov = infoMovimiento;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = infoMov;//Envia los datos para ver los mas sobre el abono o Cargo
    dialogConfig.width = '50%'; // establece el ancho del diálogo al 50% del ancho de la pantalla
    dialogConfig.height = '70%'; // establece la altura del diálogo al 50% del alto de la pantalla
    dialogConfig.disableClose = false; // desactiva la opción de cerrar el diálogo haciendo clic fuera de él
    this.dialog.open(BusquedaDialogComponent, dialogConfig);
  }
  opendialogo2(infoMovimiento: any) {//Este metodo abre el modal para visualizar los detalles del abono o pago
    let infoMov = new InfoMovimiento();
    infoMov = infoMovimiento;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = infoMov;//Envia los datos para ver los mas sobre el abono o Cargo
    dialogConfig.width = '25%'; // establece el ancho del diálogo al 50% del ancho de la pantalla
    dialogConfig.height = '26%'; // establece la altura del diálogo al 50% del alto de la pantalla
    dialogConfig.disableClose = false; // desactiva la opción de cerrar el diálogo haciendo clic fuera de él
    this.dialog.open(VerEstadoComponent, dialogConfig);
  }
  mayusculas(event: any) {
    this.claveDeRastreo = event.toUpperCase();
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
  checkboxLabel(row?: InfoMovimiento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.cve_rastreo + 1}`;
  }
  //------Aqui se exporta los datos a pdf y excel-------------------------------------
  exportarExcel() {
    if (this.primeraCasillaSeleccionada) {
      this.req.peiyu = this.localStorageService.getIdPblu("pblu");
      this.infoBancoService.listarMovimientoFiltradosPageable(this.req, 0, this.cantidad).subscribe(todos => {
        let mov = JSON.parse(JSON.stringify(todos))?.content;
        mov = mov.filter((item: { cve_rastreo: any; }) => !this.deseleccionados.some(deseleccionado => deseleccionado.cve_rastreo === item.cve_rastreo));
        let movimientosSeleccionados = mov;
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(movimientosSeleccionados);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos de la tabla');
        /* Exportar la hoja de cálculo en formato Excel */
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(dataBlob, 'movimientos.xlsx');
        this.selection.clear();
      })

    } else {
      let movimientosSeleccionados = this.selecc;

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(movimientosSeleccionados);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos de la tabla');
      /* Exportar la hoja de cálculo en formato Excel */
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(dataBlob, 'movimientos.xlsx');
      this.selection.clear();
    }

  }
  todo: InfoMovimiento[] = [];
  exportarPdf() {
    //Validad si esta chekeado ALL + filtros
    //validad si esta chekeado solo algunos
    // Obtenemos los datos seleccionados
    if (this.primeraCasillaSeleccionada) {
      this.req.peiyu = this.localStorageService.getIdPblu("pblu");
      this.infoBancoService.listarMovimientoFiltradosPageable(this.req, 0, this.cantidad).subscribe(todos => {
        let mov = JSON.parse(JSON.stringify(todos))?.content;
        mov = mov.filter((item: { cve_rastreo: any; }) => !this.deseleccionados.some(deseleccionado => deseleccionado.cve_rastreo === item.cve_rastreo));
        let pdfData: any = this.generatePdfData(mov);
        // Generamos el documento PDF y lo abrimos en una nueva pestaña del navegador
        pdfMake.createPdf(pdfData).download('movimientos.pdf');
      })
    } else {
      let movimientosSeleccionados = this.selecc;
      let pdfData: any = this.generatePdfData(movimientosSeleccionados);
      // Generamos el documento PDF y lo abrimos en una nueva pestaña del navegador
      pdfMake.createPdf(pdfData).download('movimientos.pdf');
    }
    // Generamos el contenido del PDF
  }

  generatePdfData(movimientos: InfoMovimiento[]) {//generador de pdf con la lista de
    let data = [];
    // Agregamos las columnas del encabezado
    data.push(['Clave de rastreo', 'Concepto', 'Fecha de creación', 'Tipo de movimiento','Monto', 'Institución', 'Estatus']);
    // Agregamos las filas con los datos de los movimientos seleccionados
    for (let movimiento of movimientos) {
      data.push([
        { text: movimiento.cve_rastreo, width: 'auto' },
        { text: movimiento.concepto_pago, width: 'auto' },
        { text: movimiento.fecha_creacion, width: 'auto' },
        { text: movimiento.tipomoviiento, width: 'auto' },
        { text:"$"+ movimiento.monto, width: 'auto' },
        { text: movimiento.institucion, width: 'auto' },
        { text: movimiento.estatus, width: 'auto' }
      ]);
    }
    // Devolvemos el objeto con los datos del PDF
    return {
      content: [
        { text: 'Movimientos seleccionados', style: 'header' },
        { text: 'Listado de movimientos:', style: 'subheader' },
        { text: new Date().toLocaleString(), alignment: 'right' },
        {
          table: {
            headerRows: 1,
            widths: ['18%', '16%', 'auto', '10%', '10%', 'auto', 'auto'],
            body: data,
            layout: {
              fillColor: function (rowIndex: number, node: any, columnIndex: number) {
                return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
              },
              hLineWidth: function (i: number, node: any) {
                return (i === 0 || i === node.table.body.length) ? 0 : 1;
              },
              vLineWidth: function (i: number, node: any) {
                return 0;
              },
              hLineColor: function (i: number, node: any) {
                return (i === 0 || i === node.table.body.length) ? null : '#AAAAAA';
              },
              paddingLeft: function (i: number, node: any) { return 5; },
              paddingRight: function (i: number, node: any) { return 5; },
              paddingTop: function (i: number, node: any) { return 2; },
              paddingBottom: function (i: number, node: any) { return 2; },
              defaultBorder: false
            },
            fontSize: 8
          }
        }
      ],
      styles: {
        header: { fontSize: 14, bold: true, margin: [0, 0, 0, 10] }
      }
    };
  }
  listarBanco() {//Se enlistan los bancos para mostrar en el combobox
    this.infoBancoService.listarBanco().subscribe(bancos => {
      this.listaBancos = bancos;
      this.filtradorBanco();
    })
  }

  filtradorBanco() {//En el input se puede filtrar dependiendo que vaya escribiendi el cliente por ejemplo BB =BBVA BANCOMER , BBASE ETC
    this.filteredBancos = this.listaBancos.slice();
    this.institucionControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterBancos(value))
      )
      .subscribe(filteredBancos => {
        this.filteredBancos = filteredBancos;
      });
  }
  private _filterBancos(value: string): any[] {
    const str = String(value); // Convertir la variable event en una cadena de texto
    const filterValue = str.toLowerCase();
    return this.listaBancos.filter(banco => banco.descripcion.toLowerCase().includes(filterValue));
  }
  displayIB(val: InfoBancos) {
    return val ? `${val.descripcion}` : val;
  }
  seleccionarBanco(e: any) {

    this.institucionSeleccionada = e.option.value;
  }
  req = new RequestMovimientos();
  filtar() {//Aqui se hace el filtrado de fechas y de todos los inputs disponibles

    if (this.inicio != null && this.final != null) { // Este if hace que si la fecha final y la fecha de incio no estan seleccionado los obligue a seleccionar alguna
      this.deseleccionados = [];
      this.selecc = [];
      const datePipe = new DatePipe('en-US');
      let fin = new Date(this.final);
      fin.setDate(fin.getDate() + 1);
      let ini = datePipe.transform(this.inicio, 'yyyy-MM-dd');
      let formattedDate = datePipe.transform(fin, 'yyyy-MM-dd');
      if (this.institucionControl?.value['descripcion'] == undefined) {
        this.req.institucion = ""
      } else {
        this.req.institucion = this.institucionControl?.value['descripcion'];
      }
      this.req.estatus = this.estatus.trim();
      this.req.peiyu = this.localStorageService.getIdPblu("pblu");
      this.req.claveRastreo = this.claveDeRastreo.trim();
      this.req.fechaInicio = ini + "".trim();
      this.req.fechaFinal = formattedDate + "".trim();
      this.req.tipoMovimiento = this.datos.trim();
      this.req.claveRastreo = this.claveDeRastreo.trim();
      this.req.estatus = this.estatus.trim();
      this.req.monto =parseFloat(this.monto);
      console.log(this.req)
      this.infoBancoService.listarMovimientoFiltradosPageable(this.req, 0, 10).pipe(
        catchError((error) => {
          this.openSnackBar('Error de conexion', 'Aviso');
          return of(null);
        })).subscribe(data => {
        let mov = JSON.parse(JSON.stringify(data))?.content
        this.cantidad = JSON.parse(JSON.stringify(data))?.totalElements
        this.listaMovimiento = mov;
        this.dataSource = new MatTableDataSource<InfoMovimiento>(this.listaMovimiento);
        console.log(data)
      })
    } else {
      this.openSnackBar('Seleccione una fecha de inicio y una fecha final ', 'Aviso');
    }

  }

  separarNumeros(event: any) {
    let numero = event.target.value.replace(/[^0-9\.]/g, ''); // Eliminar caracteres no numéricos del valor
    let parts = numero.split('.'); // Dividir el número en partes separadas por puntos
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Agregar comas para separar los miles
    if (parts.length === 2) {
      let decimalPart = parts[1];
      if (decimalPart.length > 2) {
        decimalPart = decimalPart.slice(0, 2); // Limitar a 2 decimales
      }
      parts[1] = decimalPart;
    }
    event.target.value = parts.join('.'); // Unir las partes del número con un punto nuevamente
   // Llamar a la función para separar y formatear el valor del IVA
  }
  openSnackBar(da1: string, da2: string) {//snakBar que se abre cuando se manda a llamar
    this._snackBar.open(da1, da2, {
      duration: 6000,
    });
  }

  getMinDate() {//La fecha de inicio tiene como maximo tres meses atras para su eleccion
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    return threeMonthsAgo;
  }

  ver(row: InfoMovimiento) {//Este metodo realiza una seleccion dependiendo de la pagina en que este  Ya que si los datos deseleccionados estan
    //dentro de la tabla pues los mantenga deseleccionado
    if (this.primeraCasillaSeleccionada) {
      const index = this.deseleccionados.findIndex(item => item.cve_rastreo === row.cve_rastreo);
      if (index !== -1) {
        this.deseleccionados.splice(index, 1);
      } else {
        this.deseleccionados.push(row);
      }
    } else {
      const index = this.selecc.findIndex(item => item.cve_rastreo === row.cve_rastreo);
      if (index !== -1) {
        this.selecc.splice(index, 1);
      } else {
        this.selecc.push(row);
      }
      this.deseleccionados = [];

    }

  }

  mostrarMas(e: any) {//Cada que cambia de pagina hara una nueva peticion de consulta con nuevo tamaño y en la pagina siguiente
    this.infoBancoService.listarMovimientoFiltradosPageable(this.req, e.pageIndex, e.pageSize).subscribe(bancos => {
      this.selection.clear();
      let mov = JSON.parse(JSON.stringify(bancos))?.content
      this.cantidad = JSON.parse(JSON.stringify(bancos))?.totalElements

      this.listaMovimiento = [];
      this.listaMovimiento = mov;
      this.dataSource = new MatTableDataSource<InfoMovimiento>(this.listaMovimiento);
      if (this.primeraCasillaSeleccionada) {
        this.selection.select(...this.dataSource.data);
      }
    });
  }
  chekeador(row: InfoMovimiento) {//Chekea los que estan en la lista
    if (this.primeraCasillaSeleccionada) {
      return true
    } else {
      for (let i = 0; i < this.selecc.length; i++) {
        if (row.cve_rastreo == this.selecc[i].cve_rastreo) {
          return true;
        }
      }
      return false
    }
  }
  chekeador2(row: InfoMovimiento) {//Deschequea los que no estan chekeaos
    if (this.primeraCasillaSeleccionada) {
      for (let i = 0; i < this.deseleccionados.length; i++) {
        if (row.cve_rastreo == this.deseleccionados[i].cve_rastreo) {
          return false;
        }
      }
    }
    return true;
  }

}
interface Tipos {
  value: string

}

