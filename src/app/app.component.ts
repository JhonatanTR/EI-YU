import { Component, ViewChild, OnInit } from '@angular/core';
import { LoginService } from './_service/login.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Cliente } from './_model/cliente';
import { LocalStorageService } from './_service/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  login: boolean = false; // Variable para indicar si se ha iniciado sesión correctamente.
  adm: boolean = false; // Variable para indicar si el usuario tiene privilegios de administrador.
  cliente: Cliente = new Cliente(); // Variable para almacenar información del cliente.
  des: string = ""; // Variable para almacenar una descripción (se inicializa como una cadena vacía).
  rolnivel3=false;
  constructor(private route: ActivatedRoute, private loginService: LoginService, private router: Router, private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    const currentUrl = window.location.href;
    if (!currentUrl.includes('login')) {
      if (this.localStorageService.getDat("log")) {
        this.login = this.localStorageService.getUsuario("log");
        this.rolnivel3= this.localStorageService.getDat("rolPermisoNivel3");
        if (this.localStorageService.getDat("rol")) {
          this.adm = this.localStorageService.getDat("rol");
         
        }
      }
    }
    this.loginService.descripcion.subscribe(de => {
      this.des = de;
    });
    this.loginService.cli.subscribe(data => {
      this.login = data.login;
    });
    this.loginService.rol.subscribe(data => {
      this.adm = data;
    });
    this.loginService.roln3.subscribe(data => {
      this.rolnivel3 = data;
    });
    this.des = this.localStorageService.getDesc("des");
  }

  title = 'Ei-Yu';
  estalogeado() {
    return this.login;
  }
  cerrarCession() {
    this.localStorageService.clear();
    let cl = new Cliente();
    cl.login = false;
    this.loginService.cli.next(cl);
    this.router.navigate(['login']);
  }
}
