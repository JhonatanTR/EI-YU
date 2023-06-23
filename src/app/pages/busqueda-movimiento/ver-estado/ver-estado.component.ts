import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InfoMovimiento } from 'src/app/_model/InfoMovimiento';
import { InfoMovimientoDetalle } from 'src/app/_model/InfoMovimientoDetalle';
import { requestMovientoDetalle } from 'src/app/_modelRequest/requestMovimientoDetalle';
import { InfoBancosService } from 'src/app/_service/info-bancos.service';
import { LocalStorageService } from 'src/app/_service/local-storage.service';

@Component({
  selector: 'app-ver-estado',
  templateUrl: './ver-estado.component.html',
  styleUrls: ['./ver-estado.component.css']
})
export class VerEstadoComponent implements OnInit {

  constructor(private localStorageService: LocalStorageService, private dialogRef: MatDialogRef<VerEstadoComponent>, @Inject(MAT_DIALOG_DATA) private data: InfoMovimiento, private bancosService: InfoBancosService) { }

  infoMovimientoDetalle!: InfoMovimientoDetalle;
  clabe: string = " ";
  ngOnInit(): void {
    this.infoMovimientoDetalle = new InfoMovimientoDetalle();
    let infoMovimiento = new InfoMovimiento();
    infoMovimiento = this.data;
    this.clabe = infoMovimiento.cve_rastreo;
    let requestMovimientoDetalle = new requestMovientoDetalle();
    requestMovimientoDetalle.activo = true;
    requestMovimientoDetalle.cve_rastreo = infoMovimiento.cve_rastreo;
    requestMovimientoDetalle.id_pblu = this.localStorageService.getUsuario("pblu").toString();
    requestMovimientoDetalle.tipoMovimiento = this.data.tipomoviiento;
    this.bancosService.listarMovientosDetalle(requestMovimientoDetalle).subscribe(data => {
      this.infoMovimientoDetalle = data;
    })
  }
  Salir() {
    this.dialogRef.close();

  }
  quitarCorchetes(texto: string): string | null {
    // Verifica si el texto contiene corchetes
    if (texto.includes('{') || texto.includes('}') || texto==="") {
      return "Favor de comunicarse con el equipo de Soporte EIYU para obtener más información.";
    } else { 
      return texto;
    }
  }

}
