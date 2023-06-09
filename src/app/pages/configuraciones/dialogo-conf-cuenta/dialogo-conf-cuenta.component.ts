import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, of } from 'rxjs';
import { InfoCuentaClabe } from 'src/app/_model/InfoCuentaClabe';
import { InfoSpei } from 'src/app/_model/InfoSpei';
import { requestOtp } from 'src/app/_modelRequest/requestOtp';
import { InfoCuentaclabeService } from 'src/app/_service/info-cuentaclabe.service';
import { InfoLoginService } from 'src/app/_service/info-login.service';
import { LocalStorageService } from 'src/app/_service/local-storage.service';

@Component({
  selector: 'app-dialogo-conf-cuenta',
  templateUrl: './dialogo-conf-cuenta.component.html',
  styleUrls: ['./dialogo-conf-cuenta.component.css']
})
export class DialogoConfCuentaComponent implements OnInit {
  cuentas: InfoCuentaClabe[] = [];
  displayedColumns: string[] = ['numC', 'Acciones'];
  codigoOtp: string = "";
  @ViewChild('myInput') myInput!: ElementRef;
  datEliminar: string = "";
  seleccionado: string = "";
  dataSource = new MatTableDataSource<InfoCuentaClabe>([]);
  mostrarBotonModificar = false;
  mostrarBotonagregar = true;
  mensajeDeValidacion: string = "";
  constructor(private localStorageService: LocalStorageService, private dialogRef: MatDialogRef<DialogoConfCuentaComponent>, private _snackBar: MatSnackBar, private infoLoginService: InfoLoginService, private infoCuentaClabeService: InfoCuentaclabeService) {

   }
  datoAeditar!: InfoCuentaClabe;
  ngOnInit(): void {
    let res = { "peiyu": this.localStorageService.getUsuario("pblu") }
    this.infoCuentaClabeService.listarPagosDeAutorizarPblu(res).pipe(
      catchError((error) => {
        
        this.openSnackBar('Se produjo un error de conexión. Por favor, inténtelo de nuevo más tarde.', 'Aviso');
        return of([]);
      })).subscribe(data => {
      this.cuentas = data;
      this.dataSource = new MatTableDataSource<InfoCuentaClabe>(data);
    })
  }
  listarNuevo() {//Este metodo funciona para listar las modificaciones y a cargar la lista de nuevo
    let res = { "peiyu": this.localStorageService.getUsuario("pblu") }

    this.infoCuentaClabeService.listarPagosDeAutorizarPblu(res).subscribe(data => {
      this.cuentas = data;
      this.dataSource = new MatTableDataSource<InfoCuentaClabe>(data);
    })
  }
  agregarAlatabla() {
    let datoseleccionado: string = this.seleccionado;
    let datss = new InfoCuentaClabe();
    datss.cuentaClabe = datoseleccionado;
    datss.pblu= this.localStorageService.getUsuario("pblu") 
    console.log( datss.pblu)
    if (datoseleccionado.length > 17) {
      console.log("String del input",datoseleccionado)
      if (datoseleccionado != "") {
        console.log("String del input",datoseleccionado)
        if (this.cuentas.length < 2) {
          for (let data of this.cuentas) {
            console.log("lista De cuentas clabes",data)
            if (data.cuentaClabe != datoseleccionado) {
              this.infoCuentaClabeService.guardarEnLatablaListarPagos(datss).pipe(
                catchError((error) => {
                  this.openSnackBar('Error Alta de la cuenta', 'Aviso');
                  return of(null);
                })
              ).subscribe(data => {
                let res = { "peiyu": this.localStorageService.getUsuario("pblu") }
                this.infoCuentaClabeService.listarPagosDeAutorizarPblu(res).subscribe(date => {
                  this.cuentas = date;
                  this.dataSource = new MatTableDataSource<InfoCuentaClabe>(date);
                })
              })
            } else {
              this.openSnackBar("Este numero de cuenta ya existe", "Aviso");
            }
          }
        } else {
          this.openSnackBar("Excede el maximo de cuentas permitidas", "Aviso");
        }
      } else {
        this.openSnackBar("Numero de cuenta necesarío", "Aviso");
      }
      this.seleccionado = "";
    } else {
      this.openSnackBar("Numero de cuenta incorrecta", "Aviso");
    }
  }

  modificar() {
    let datoseleccionado: string = this.seleccionado;
    if (datoseleccionado.length > 17) {
      if (datoseleccionado != "") {
        this.datoAeditar.cuentaClabe = datoseleccionado;
        this.infoCuentaClabeService.modificar(this.datoAeditar).subscribe(data => {
          this.infoCuentaClabeService.listarPagosDeAutorizar().subscribe(datas => {
            this.infoCuentaClabeService.listaCuentaNueva.next(datas);
            this.listarNuevo();
            this.mensajeDeValidacion="";
          });
        });
      } else {
        this.openSnackBar("Numero de cuenta necesarío", "Aviso");
      }
      this.seleccionado = "";
    } else {
      this.openSnackBar("Numero de cuenta incorrecta", "Aviso");
    }
    this.mostrarBotonModificar = false;
    this.mostrarBotonagregar = true;
  }
  openSnackBar(da1: string, da2: string) {
    this._snackBar.open(da1, da2, {
      duration: 2000,
    });
  }
  eliminar(element: InfoCuentaClabe) {
    if (this.mensajeDeValidacion == "Otp validado correctamente") {
      this.infoCuentaClabeService.eliminar(element).subscribe(data => {
        this.openSnackBar("Eliminado correctamente", "Aviso");
        this.infoCuentaClabeService.listarPagosDeAutorizar().subscribe(datas => {
          this.infoCuentaClabeService.listaCuentaNueva.next(datas);
          this.listarNuevo();
          this.mensajeDeValidacion="";
        });
      })
    } else {
      this.myInput.nativeElement.focus();
      this.openSnackBar("Introduzca el codigo otp", "Aviso");
    }
  }
  editar(element: InfoCuentaClabe) {
    if (this.mensajeDeValidacion == "Otp validado correctamente") {
      this.seleccionado = element.cuentaClabe;
      this.datoAeditar = element;
      this.mostrarBotonModificar = true;
      this.mostrarBotonagregar = false;
    } else {
      this.myInput.nativeElement.focus();
      this.openSnackBar("Introduzca el codigo otp", "Aviso");
    }

  }
  enviar() {
    let InfSpei = new InfoSpei();
    InfSpei = this.localStorageService.getUsuario("userE");
    let request = new requestOtp();
    request.idUsuario = InfSpei.idUsuario;
    request.otp = this.codigoOtp.trim();
    this.infoLoginService.verificarOtp(request).pipe(
      catchError((error) => {
        this.openSnackBar('Error codigo OTP, Intente de nuevo', 'Aviso');
        return of(null);
      })
    ).subscribe(data => {
       if (data?.mensaje == "Otp validado correctamente") {
      this.mensajeDeValidacion = "Otp validado correctamente";
      this.openSnackBar("Modificación y Eliminacion Disponible", "Aviso");
      this.codigoOtp = "";
      } else {

      }
    })

  }
  salir() {
    this.dialogRef.close();
  }
  isInputInvalid = false;
  validateInput(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9]*$/;
    const inputChar = String.fromCharCode(event.keyCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
      this.isInputInvalid = true;
    } else {
      this.isInputInvalid = false;
    }
  }
  validarNumeroCuenta(event: any): void {
    const keyCode = event.keyCode || event.which;
    const tecla = String.fromCharCode(keyCode);
    const expresionRegular = /^[0-9]+$/;
    if (!expresionRegular.test(tecla) && keyCode !== 8 && keyCode !== 46) {
      event.preventDefault();
    }
  }
}
