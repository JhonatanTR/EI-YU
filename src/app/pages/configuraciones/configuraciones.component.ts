import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogoConfCuentaComponent } from './dialogo-conf-cuenta/dialogo-conf-cuenta.component';
import { InfoLoginService } from 'src/app/_service/info-login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InfoCuentaclabeService } from 'src/app/_service/info-cuentaclabe.service';
import { LocalStorageService } from 'src/app/_service/local-storage.service';

@Component({
  selector: 'app-configuraciones',
  templateUrl: './configuraciones.component.html',
  styleUrls: ['./configuraciones.component.css']
})
export class ConfiguracionesComponent implements OnInit {
 
  constructor(private dialog: MatDialog,private localStorageService: LocalStorageService,  private _snackBar: MatSnackBar, private infoLoginService: InfoLoginService, private infoCuentaClabeService: InfoCuentaclabeService) { }
  activo = false
  ngOnInit(): void {
    let res = { "peiyu": this.localStorageService.getUsuario("pblu") }
    this.infoCuentaClabeService.buscarPbluConCuenta(res).subscribe(data => {
      let clabe = { "clabe": data.clabe_pblu };
      this.infoCuentaClabeService.buscarCuentaExiste(clabe).subscribe(d => {
        if (d == null) {
          this.activo = true;
       
        } else {
          this.activo = false;
         
        }
      })
    })
  }
  openDiaCuenta(){
    if(this.activo==false){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '50%'; // establece el ancho del diálogo al 50% del ancho de la pantalla
      dialogConfig.height = 'auto'; // establece la altura del diálogo al 50% del alto de la pantalla
      dialogConfig.maxWidth = '93%'; // establece el ancho máximo del diálogo al 90% del ancho de la pantalla
      dialogConfig.maxHeight = '93%'; // establece la altura máxima del diálogo al 90% del alto de la pantalla
      dialogConfig.disableClose = false; // desactiva la opción de cerrar el diálogo haciendo clic fuera de él
      this.dialog.open(DialogoConfCuentaComponent, dialogConfig);
    }else{
      this.openSnackBar('Su cuenta no está completamente configurada, comuníquese con soporte EIYU', 'Aviso');
    }

  }
 
  openSnackBar(da1: string, da2: string) {
    this._snackBar.open(da1, da2, {
      duration: 6000,
    });
  }
}

