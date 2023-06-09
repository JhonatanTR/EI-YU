import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogoConfCuentaComponent } from './dialogo-conf-cuenta/dialogo-conf-cuenta.component';

@Component({
  selector: 'app-configuraciones',
  templateUrl: './configuraciones.component.html',
  styleUrls: ['./configuraciones.component.css']
})
export class ConfiguracionesComponent implements OnInit {

  constructor(private dialog: MatDialog,) { }

  ngOnInit(): void {
  }
  openDiaCuenta(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '50%'; // establece el ancho del diálogo al 50% del ancho de la pantalla
    dialogConfig.height = 'auto'; // establece la altura del diálogo al 50% del alto de la pantalla
    dialogConfig.maxWidth = '93%'; // establece el ancho máximo del diálogo al 90% del ancho de la pantalla
    dialogConfig.maxHeight = '93%'; // establece la altura máxima del diálogo al 90% del alto de la pantalla
    dialogConfig.disableClose = false; // desactiva la opción de cerrar el diálogo haciendo clic fuera de él
    this.dialog.open(DialogoConfCuentaComponent, dialogConfig);
  }
  
}
