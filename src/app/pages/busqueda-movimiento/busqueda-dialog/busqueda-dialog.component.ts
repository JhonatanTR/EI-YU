import { Component, Inject, OnInit } from '@angular/core';
import { DialogoComponent } from '../../enviar-pago/dialogo/dialogo.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { requestMovientoDetalle } from 'src/app/_modelRequest/requestMovimientoDetalle';
import { InfoMovimiento } from 'src/app/_model/InfoMovimiento';
import { InfoBancosService } from 'src/app/_service/info-bancos.service';
import { InfoMovimientoDetalle } from 'src/app/_model/InfoMovimientoDetalle';
import { LocalStorageService } from 'src/app/_service/local-storage.service';

@Component({
  selector: 'app-busqueda-dialog',
  templateUrl: './busqueda-dialog.component.html',
  styleUrls: ['./busqueda-dialog.component.css']
})
export class BusquedaDialogComponent implements OnInit {

  constructor(private localStorageService: LocalStorageService, private dialogRef: MatDialogRef<BusquedaDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: InfoMovimiento, private bancosService: InfoBancosService) { }
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
    requestMovimientoDetalle.monto = this.data.monto
    this.bancosService.listarMovientosDetalle(requestMovimientoDetalle).subscribe(data => {
      this.infoMovimientoDetalle = data;
    })
  }
  obtenerCuentaEnmascarada(cuenta: string): string {
    const dosUltimos = cuenta.slice(-4);
    return `***${dosUltimos}`;
  }


  Salir() {
    this.dialogRef.close();

  }
}
