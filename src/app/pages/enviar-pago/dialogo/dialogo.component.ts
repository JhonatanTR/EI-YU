import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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
  datos: any[] = []//datos que trae el excel
  divEscondido: boolean = true;//la variable del div que contiene la tabla de los datos del excel
  codigoOtp: string = "";
  montoTotal:number=0;//total del monto de todos los  datos
  displayedColumns: string[] = ['Instituto', 'monto', 'iva', 'claveDeRastreo', 'conceptoPago', 'refNumerica', 'cobranza', 'origen', 'nomBeneficiario'
    , 'rfcBeneficiario', 'cuentaBancaria'];
  dataSource!: MatTableDataSource<Transacciones>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private loginService: LoginService, private dialogRef: MatDialogRef<DialogoComponent>, private localStorageService: LocalStorageService) { }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource(this.tran);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  ngOnInit(): void {
    if (this.localStorageService.getList("list") != null) {
      for (let i = 0; i < this.localStorageService.getList("list").length; i++) {
        this.tran.push(this.localStorageService.getList("list")[i]);
       let m= parseInt(this.tran[i].monto);
        this.montoTotal =this.montoTotal+m;
      }
      this.dataSource = new MatTableDataSource(this.tran);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.divEscondido = false;
    } else {
      this.dataSource = new MatTableDataSource(this.tran);
    }
  }
  enviar() { }
  cargarArchivo(event: any) {
    this.montoTotal=0;
    this.tran = []
    const archivo = event.target.files[0];
    const lector = new FileReader();
    lector.readAsBinaryString(archivo);
    lector.onload = () => {
      const libro = XLSX.read(lector.result, { type: 'binary' });
      const hoja = libro.Sheets[libro.SheetNames[0]];
      this.datos = XLSX.utils.sheet_to_json(hoja);
      for (let i = 0; i < this.datos.length; i++) {
        let trans = new Transacciones();
        trans.institucion = this.datos[i]['Institución beneficiaria'];
        trans.monto = this.datos[i]['monto'];
        trans.iva = this.datos[i]['iva'];
        trans.claveDeRastreo = this.datos[i]['claveDeRastreo'];
        trans.conceptoPago = this.datos[i].conceptoPago;
        trans.refNumerica = this.datos[i].refNumerica;
        trans.cobranza = this.datos[i].cobranza;
        trans.origen = this.datos[i].origen;
        trans.nomBeneficiario = this.datos[i].nomBeneficiario;
        trans.rfcBeneficiario = this.datos[i].rfcBeneficiario;
        trans.cuentaBancaria = this.datos[i].cuentaBancaria;
        trans.codigoOtp = this.datos[i].codigoOtp;
        this.tran.push(trans)
        let m= parseInt(this.tran[i].monto);
        this.montoTotal =this.montoTotal+m;
      };
      this.localStorageService.setList("list", this.tran)
      this.divEscondido = false;
      this.ngAfterViewInit();
    };
  }
  Salir() {
    this.dialogRef.close();
  }






}
