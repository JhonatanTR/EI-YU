import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InfoPersonaFisica } from 'src/app/_model/InfoPersonaFisica';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import * as XLSX from 'xlsx';



@Component({
  selector: 'app-cargar-cuenta',
  templateUrl: './cargar-cuenta.component.html',
  styleUrls: ['./cargar-cuenta.component.css']
})
export class CargarCuentaComponent implements OnInit {
  datosExcel: InfoPersonaFisica[] = []
  datos: any[] = []//datos que trae el excel
  divEscondido: boolean = true;//la variable del div que contiene la tabla de los datos del excel
  displayedColumns: string[] = ['Destino', 'Beneficiario', 'Número de Cuenta', 'Banco', 'Monto', 'Ref. Num', 'Concepto Pago'];
  dataSource!: MatTableDataSource<InfoPersonaFisica>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    if (this.localStorageService.getExcel("datosExcel") != null) {
      this.datosExcel = this.localStorageService.getExcel("datosExcel");
      this.dataSource = new MatTableDataSource(this.datosExcel);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.divEscondido = false;
    } else {
      this.dataSource = new MatTableDataSource(this.datosExcel);
    }
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource(this.datosExcel);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    console.log(this.datosExcel)
    /*for (let m of this.datosExcel) {
      this.montoTotal = this.montoTotal + parseFloat(m.monto);
    }*/
  }
  cargarXLSX(event: Event){
    const inputElement = event.target as HTMLInputElement;
    let archivo = inputElement.files;
    if(archivo != null){
      this.datosExcel = []
      const lector = new FileReader();
      lector.readAsBinaryString(archivo[0]);
      lector.onload = () => {
        const libro = XLSX.read(lector.result, { type: 'binary' });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        this.datos = XLSX.utils.sheet_to_json(hoja);
        for (let i = 0; i < this.datos.length; i++) {
          if (this.datos[i]['Destino'].length == 18) {
            let trans = new InfoPersonaFisica();
            trans.ctaDestino = this.datos[i]['Destino'];
            trans.nombreDestino = this.datos[i]['Nombre Beneficiario'];
            trans.clabe = this.datos[i]['Numero de cuenta'];
            trans.bancoDestino = this.datos[i]['Institucion bancaria'];
            trans.monto = this.datos[i]['Monto'];
            trans.refNum = this.datos[i]['Referencia Numerica'];
            trans.conceptoPago = this.datos[i]['Concepto pago'];
            trans.cveRastreo = "asw2";
            this.datosExcel.push(trans)
          }
        };
        this.localStorageService.setExcel("datosExcel", this.datosExcel);
        this.divEscondido = false;
        this.ngAfterViewInit();
      };
    }
  }

  applyFilter($event: Event){
    //TODO
  }

}
