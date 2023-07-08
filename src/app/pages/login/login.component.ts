import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Cliente } from 'src/app/_model/cliente';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { LoginService } from 'src/app/_service/login.service';
import { EnrolarTokenComponent } from '../enrolar-token/enrolar-token.component';
import { InfoLoginService } from 'src/app/_service/info-login.service';
import { login } from 'src/app/_model/InfoLogin';
import { RequestLogin } from 'src/app/_modelRequest/requestLogin';
import { InfoSpei } from 'src/app/_model/InfoSpei';
import { InfoBancosService } from 'src/app/_service/info-bancos.service';
import { catchError, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InfoCuentaclabeService } from 'src/app/_service/info-cuentaclabe.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  username: string = "";
  email: string = "";
  otp: string = "";
  isSignUp: boolean = true;
  password: string = "";
  showError: boolean = false;
  errorMessage: string = 'Error: Credenciales inválidas. Intente de nuevo.';
  loading: boolean;
  constructor(private infoCuentaClabeService: InfoCuentaclabeService, private _snackBar: MatSnackBar, private des: InfoBancosService, private dialog: MatDialog,
   private loginServices: InfoLoginService, private loginService: LoginService, private router: Router, private localStorageService: LocalStorageService) {
    this.loading = false;
  }
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);

  ngOnInit(): void {
    this.localStorageService.clear();
    let cli = new Cliente;
    cli.login = false;
    this.loginService.cli.next(cli);
    this.form = new FormGroup({
      'user': new FormControl(''),
      'password': new FormControl(''),
      'otp': new FormControl(''),
    });
  }
  signIn() {

  }
  cl = new Cliente();
  user !: Usuario;
  operar() {
    let log = new login();
    this.username = this.form.value['user'];
    this.password = this.form.value['password'];
    this.otp = this.form.value['otp'];
    if (this.otp != "") {
      log.otp = this.otp.trim();
    }
    log.usuario = this.username.trim();
    log.password = this.password.trim();
    this.loginServices.login(log).pipe(
      catchError((error) => {
        this.openSnackBar('Se produjo un error de conexión. Por favor, inténtelo de nuevo más tarde.', 'Aviso');
        return of(null);
      })
    ).subscribe(da => {//login al portal
      if (da != null) {
        if (da.mensaje == "USUARIO/CONTRASEÑA INCORRECTO") {
          this.showError = true;
          setTimeout(() => {
            this.showError = false;
          }, 3000);
        } else {
          this.loading = true
          let dato = { "peiyu": da.usuario.idParticipante };
          let rql = new RequestLogin();
          rql.username = da.usuario.apiPassword.username;
          rql.password = da.usuario.apiPassword.password;
          this.loginServices.token(rql).subscribe(data => {
            this.localStorageService.setDesc("token", data.response.toString());
            this.loginService.enviarMensaje(data.response.toString())
          })
          this.localStorageService.setDesc("usuario", da.usuario.idUsuario);
          this.des.descripcion(dato).subscribe(data => {
            this.localStorageService.setDesc("des", data.descripcion);
            this.loginService.descripcion.next(data.descripcion);
          })
          if (da.mensaje == "OK") {
            if (da.usuario.rol.idRol == 1) {
              this.loginService.rol.next(true)
              this.localStorageService.setDat("rol", true)
            } else {

              this.loginService.rol.next(false)
              this.localStorageService.setDat("rol", false)
              if(da.usuario.usuarios_permisos[0].id==2){

                this.localStorageService.setDesc("permiso", da.usuario.usuarios_permisos[0].id.toString());
              }else if(da.usuario.usuarios_permisos[0].id==3){

                this.localStorageService.setDesc("permiso",  da.usuario.usuarios_permisos[0].id.toString())
                 this.localStorageService.setDesc("idUser_1",  da.usuario.id)
              }
            }
            let res = { "peiyu": da.usuario.idParticipante }
            this.infoCuentaClabeService.buscarPbluConCuenta(res).subscribe(data => {
              if (data.clabe_pblu == "") {
                this.openSnackBar('PARTICIPANTE NO CONFIGURADO. FAVOR DE COMUNICARSE CON SOPORTE EIYU.', 'Aviso');
              } else {
                this.loading = false;
                this.router.navigate(['dashboard']);
                let cli = new Cliente;
                let InfoSpe = new InfoSpei();
                InfoSpe.idUsuario = da.usuario.id;
                InfoSpe.username = da.usuario.apiPassword.username;
                InfoSpe.password = da.usuario.apiPassword.password;
                InfoSpe.certificado = da.usuario.apiPassword.certificado;
                InfoSpe.llave = da.usuario.apiPassword.llave;
                InfoSpe.phrase = da.usuario.apiPassword.phrase;
                this.localStorageService.setUsuario("userE", InfoSpe);
                this.localStorageService.setIdPblu("pblu", da.usuario.idParticipante);
                this.localStorageService.setDat("log", true)
                this.loginService.cli.next(cli);
                if (da.usuario.token?.activo == true || da.usuario.token != null) {
                  //TODO: Do something
                } else {
                  if (da.usuario.token == null) {
                    if (da.usuario.rol.idRol == 1 || da.usuario.usuarios_permisos[0].id==3) {
                      setTimeout(() => {
                        this.openDialogo(da.usuario.id);
                      }, 1000);
                    }
                  }
                }
              }
            })
          } else {
            let cli = new Cliente;
            cli.login = false;
            this.loginService.cli.next(cli);

          }
        }
      }
    })

  }
  openSnackBar(da1: string, da2: string) {//snakBar que se abre cuando se manda a llamar
    this._snackBar.open(da1, da2, {
      duration: 6000,
    });
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
}
interface Usuario {
  username: string;
  password: string;
}
