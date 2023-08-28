import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Cliente } from 'src/app/_model/cliente';
import { InfoCuentaclabeService } from 'src/app/_service/info-cuentaclabe.service';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { LoginService } from 'src/app/_service/login.service';
import { EnrolarTokenComponent } from 'src/app/pages/enrolar-token/enrolar-token.component';

@Component({
  templateUrl: './select-profile.component.html',
  styleUrls: ['./select-profile.component.css']
})
export class SelectProfileComponent implements OnInit {
  datalogin: any = {};
  perfiles: any[] = [];
  usuario: string = "";
  clabeMadre: string = "";
  isSelected: boolean = false;

  constructor(
    private infoCuentaClabeService: InfoCuentaclabeService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private loginService: LoginService,
    private localStorageService: LocalStorageService,
    private segundoPerfilService: LoginService
  ) { }

  ngOnInit(): void {

    this.busquedaCuentaConcentradora();
    setTimeout(() => {
    this.datalogin = this.localStorageService.getDataLogin("perfiles");
    this.usuario = this.localStorageService.getDesc("des");
    this.datalogin.usuario.segundo_perfil.forEach((perfil: any) => {
      this.perfiles.push(perfil);
    });
    }, 100);
  }
  selectProfile(perfil: any) {
    this.localStorageService.setData("cuenta", perfil.cuenta);
    if(!perfil.selected){
      this.perfiles.forEach(perfil => {
        perfil.selected = false;
      });
      perfil.selected = true;
      this.isSelected = true;
    }else{
      perfil.selected = false;
      this.isSelected = false;
    }
  }
  continue() {
    let cli = new Cliente();

    if(this.clabeMadre !== this.localStorageService.getData('cuenta')){
      this.localStorageService.setBoolean("segundoPerfil", true);
      this.segundoPerfilService.setSegundoPerfil(true);
    }else{
      this.localStorageService.setBoolean("segundoPerfil", false);
      this.segundoPerfilService.setSegundoPerfil(false);
    }

    this.loginService.cli.next(cli);
    this.router.navigate(['dashboard']);

    if (
      this.datalogin.usuario.token?.activo == true ||
      this.datalogin.usuario.token != null
    ) {
      //TODO: Do something
    } else {
      if (this.datalogin.usuario.token == null) {
        if (
          this.datalogin.usuario.rol.idRol == 1 ||
          this.datalogin.usuario.usuarios_permisos[0].id == 3
        ) {
          setTimeout(() => {
            this.openDialogo(this.datalogin.usuario.id);
          }, 1000);
        }
      }
    }

  }
  openDialogo(id: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '40%'; // establece el ancho del diálogo al 50% del ancho de la pantalla
    dialogConfig.height = 'auto'; // establece la altura del diálogo al 50% del alto de la pantalla
    dialogConfig.maxWidth = '93%'; // establece el ancho máximo del diálogo al 90% del ancho de la pantalla
    dialogConfig.maxHeight = '93%'; // establece la altura máxima del diálogo al 90% del alto de la pantalla
    dialogConfig.disableClose = true; // desactiva la opción de cerrar el diálogo haciendo clic fuera de él
    dialogConfig.data = id;
    this.dialog.open(EnrolarTokenComponent, dialogConfig);
  }
  busquedaCuentaConcentradora() {
    let res = { "peiyu": this.localStorageService.getUsuario("pblu") }
    this.infoCuentaClabeService.buscarPbluConCuenta(res).subscribe(data => {
      let clabe = {
        "clabe": data.clabe_pblu,
        "pblu": this.localStorageService.getUsuario("pblu")
      };
      this.infoCuentaClabeService.buscarCuentaExiste(clabe).subscribe(d => {
        if (d == null) {
        } else {
          this.clabeMadre = d.clabe;
        }
      })
    })
  }
}
