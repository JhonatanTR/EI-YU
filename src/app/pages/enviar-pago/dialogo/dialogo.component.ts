import { ConstantPool } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InfoCapturaSPEIPago } from 'src/app/_model/InfoCapturaSPEIPago';
import { Transacciones } from 'src/app/_model/transacciones';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { LoginService } from 'src/app/_service/login.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-dialogo',
  templateUrl: './dialogo.component.html',
  styleUrls: ['./dialogo.component.css']
})
export class DialogoComponent implements OnInit {
  tran: Transacciones[] = []; //variable donde se almacenaran los datos del excel para exponer en la pantalla
  envioMazivo: InfoCapturaSPEIPago[] = [];
  datos: any[] = []//datos que trae el excel
  divEscondido: boolean = true;//la variable del div que contiene la tabla de los datos del excel
  codigoOtp: string = "";
  montoTotal: number = 0;//total del monto de todos los  datos
  displayedColumns: string[] = ['Destino', 'Beneficiario', 'Número de Cuenta', 'Banco', 'Monto', 'Ref. Num', 'Concepto Pago'];
  dataSource!: MatTableDataSource<InfoCapturaSPEIPago>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private loginService: LoginService, private dialogRef: MatDialogRef<DialogoComponent>, private localStorageService: LocalStorageService) { }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource(this.envioMazivo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    console.log(this.envioMazivo)
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
    if (this.localStorageService.getExcelList("listExel") != null) {
      this.envioMazivo = this.localStorageService.getExcelList("listExel");
      this.dataSource = new MatTableDataSource(this.envioMazivo);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.divEscondido = false;
    } else {
      this.dataSource = new MatTableDataSource(this.envioMazivo);
    }
  }
  enviar() { }
  

  cargarArchivo2(event: any) {
    this.montoTotal = 0;
    this.envioMazivo = []
    const archivo = event.target.files[0];
    const lector = new FileReader();
    lector.readAsBinaryString(archivo);
    lector.onload = () => {
      const libro = XLSX.read(lector.result, { type: 'binary' });
      const hoja = libro.Sheets[libro.SheetNames[0]];
      this.datos = XLSX.utils.sheet_to_json(hoja);
      for (let i = 0; i < this.datos.length; i++) {
        if (this.datos[i]['Destino'].length == 18) {
          let trans = new InfoCapturaSPEIPago();
          trans.ctaDestino = this.datos[i]['Destino'];
          trans.nombreDestino = this.datos[i]['Nombre Beneficiario'];
          trans.clabe = this.datos[i]['Numero de cuenta'];
          trans.bancoDestino = this.datos[i]['Institucion bancaria'];
          trans.monto = this.datos[i]['Monto'];
          trans.refNum = this.datos[i]['Referencia Numerica'];
          trans.conceptoPago = this.datos[i]['Concepto pago'];
          trans.cveRastreo = "asw2";
          this.envioMazivo.push(trans)
        }
      };
      this.localStorageService.setExcelList("listExel", this.envioMazivo);
      this.divEscondido = false;
      this.ngAfterViewInit();
    };
  }

  Salir() {
    this.dialogRef.close();
  }






}
