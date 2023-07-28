import { ConstantPool } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InfoCapturaSPEIPago } from 'src/app/_model/InfoCapturaSPEIPago';
import { Transacciones } from 'src/app/_model/transacciones';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { LoginService } from 'src/app/_service/login.service';
import * as XLSX from 'xlsx';
import { DialogoDialogCleanComponent } from './dialogo-dialog-clean/dialogo-dialog-clean.component';
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
  codigoOtp: string = '';
  montoTotal: number = 0; //total del monto de todos los  datos
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
    private dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource(this.envioMazivo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    for (let m of this.envioMazivo) {
      this.montoTotal = this.montoTotal + parseFloat(m.monto);
    }
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
    }
  }
  enviar() {}
  validarSoloNumeros(dato: string): boolean {
    const regex = /^\d+$/;
    return regex.test(dato);
  }
  validarDatoNoNumeros(dato: string): boolean {
    const regex = /^[A-Za-z\s]*$/;
    return regex.test(dato);
  }
  cargarArchivo2(event: any) {
    this.montoTotal = 0;
    this.envioMazivo = [];
    const archivo = event.target.files[0];
    const lector = new FileReader();
    lector.readAsBinaryString(archivo);
    lector.onload = () => {
      let aux = 0;
      const libro = XLSX.read(lector.result, { type: 'binary' });
      const hoja = libro.Sheets[libro.SheetNames[0]];
      this.datos = XLSX.utils.sheet_to_json(hoja);
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

          trans.nombreDestino = this.datos[i]['Nombre Beneficiario'];
          trans.clabe = this.datos[i]['Numero de cuenta'];
          trans.bancoDestino = this.datos[i]['Institucion bancaria'];
          trans.monto = this.datos[i]['Monto'];
          trans.refNum = this.datos[i]['Referencia Numerica'];
          trans.conceptoPago = this.datos[i]['Concepto pago'];
          trans.cveRastreo = 'asw2';
          this.envioMazivo.push(trans);



        }else{
          this.snackBar.open(
            `Carga interrumpida: El archivo no puede contener más de 50 registros.`,
            'Cerrar',
            { duration: 3000 }
          );
          break;
        }

      }
      for (let j = 0; j < this.envioMazivo.length; j++) {
        if (
          this.envioMazivo[j].ctaDestino.length == 18 &&
          this.envioMazivo[j].clabe.length == 18
        ) {
          console.log;
        }
      }
      this.localStorageService.setExcelList('listExel', this.envioMazivo);
      this.divEscondido = false;
      this.ngAfterViewInit();
    };
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
}
