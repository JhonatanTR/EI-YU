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
  styleUrls: ['./cargar-cuenta.component.css'],
})
export class CargarCuentaComponent implements OnInit {
  datosExcel: InfoPersonaFisica[] = [];
  datos: any[] = []; //datos que trae el excel
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
    'Fecha de Nacimiento'
  ];
  dataSource!: MatTableDataSource<InfoPersonaFisica>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private localStorageService: LocalStorageService) {}

  ngOnInit(): void {
    if (this.localStorageService.getExcel('datosExcel') != null) {
      this.datosExcel = this.localStorageService.getExcel('datosExcel');
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
    console.log(this.datosExcel);
    /*for (let m of this.datosExcel) {
      this.montoTotal = this.montoTotal + parseFloat(m.monto);
    }*/
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
    }
  }

}
