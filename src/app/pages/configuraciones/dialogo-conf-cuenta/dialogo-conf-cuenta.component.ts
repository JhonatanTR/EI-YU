import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { isNullOrUndef } from 'chart.js/dist/helpers/helpers.core';
import { catchError, of } from 'rxjs';
import { InfoBancos } from 'src/app/_model/InfoBancos';
import { InfoCuentaClabe } from 'src/app/_model/InfoCuentaClabe';
import { InfoSpei } from 'src/app/_model/InfoSpei';
import { requestOtp } from 'src/app/_modelRequest/requestOtp';
import { InfoBancosService } from 'src/app/_service/info-bancos.service';
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
  listaBancos: InfoBancos[] = [];
  displayedColumns: string[] = ['numC', 'nomBanci', 'Acciones'];
  codigoOtp: string = "";
  @ViewChild('myInput') myInput!: ElementRef;
  datEliminar: string = "";
  seleccionado: string = "";
  dataSource = new MatTableDataSource<InfoCuentaClabe>([]);
  mostrarBotonModificar = false;
  mostrarBotonagregar = true;
  mensajeDeValidacion: string = "";
  activo = true
  clabeMadre: string = "";
  constructor(private infoBancoService: InfoBancosService, private localStorageService: LocalStorageService, private dialogRef: MatDialogRef<DialogoConfCuentaComponent>, private _snackBar: MatSnackBar, private infoLoginService: InfoLoginService, private infoCuentaClabeService: InfoCuentaclabeService) {
    this.cuentas = [];
  }
  datoAeditar!: InfoCuentaClabe;
  ngOnInit(): void {
    this.listarBanco();
    let res = { "peiyu": this.localStorageService.getUsuario("pblu") }
    this.infoCuentaClabeService.buscarPbluConCuenta(res).subscribe(data => {
      let clabe = { "clabe": data.clabe_pblu };
      this.infoCuentaClabeService.buscarCuentaExiste(clabe).subscribe(d => {
        if (d == null) {
          this.activo = true;
          this.openSnackBar2('Su cuenta no está completamente configurada, comuníquese con soporte EIYU', 'Aviso');
        } else {
          this.clabeMadre = d.clabe;
          this.activo = false;
        
          this.infoCuentaClabeService.listarPagosDeAutorizarPblu(res).pipe(
            catchError((error) => {
              this.openSnackBar('Se produjo un error de conexión. Por favor, inténtelo de nuevo más tarde.', 'Aviso');
              return of([]);
            })).subscribe(data => {
              this.cuentas = data;
              for (let i = 0; i < this.cuentas.length; i++) {
      
                for (let j = 0; j < this.listaBancos.length; j++) {
                  if (this.cuentas[i].id_banco === this.listaBancos[j].id_banco) {
                    this.cuentas[i].bancoNombre = this.listaBancos[j].descripcion;
                  }
                }
              }
             
              this.dataSource = new MatTableDataSource<InfoCuentaClabe>(this.cuentas);
            })
        }
      })
    })
  }
  listarBanco() {//aqui se carga la lista de los bancos disponibles
    this.infoBancoService.listar().subscribe(bancos => {
      this.listaBancos = bancos;
    })

  }
  listarNuevo() {//Este metodo funciona para listar las modificaciones y a cargar la lista de nuevo
    let res = { "peiyu": this.localStorageService.getUsuario("pblu") }
    this.infoCuentaClabeService.listarPagosDeAutorizarPblu(res).subscribe(data => {
      this.cuentas = data;
      for (let i = 0; i < this.cuentas.length; i++) {
        this.cuentas[i];
        for (let j = 0; j < this.listaBancos.length; j++) {
          if (this.cuentas[i].id_banco === this.listaBancos[j].id_banco) {
            this.cuentas[i].bancoNombre = this.listaBancos[j].descripcion;
          }
        }
      }
    
      this.dataSource = new MatTableDataSource<InfoCuentaClabe>(this.cuentas);
    })
  }
  agregarAlatabla() {
    let a: number | undefined;

    let datoseleccionado: string = this.seleccionado;
    let datss = new InfoCuentaClabe();
    datss.cuentaClabe = datoseleccionado;
    datss.pblu = this.localStorageService.getUsuario("pblu");
    if (datoseleccionado.length > 17) {
      if (this.cuentas.length < 2) {
        const index = this.cuentas.findIndex(item => item.cuentaClabe === datoseleccionado);
        if (this.clabeMadre != datoseleccionado) {
          if (index != null && Number(index) > -1) {
            this.openSnackBar("Este numero de cuenta ya existe", "Aviso");
          } else {
            let primerasTresLetras: string = datoseleccionado.substring(0, 3);
            for (let i = 0; i < this.listaBancos.length; i++) {
              var ultimos_tres_digitos =  this.listaBancos[i].id_banco.toString().substr(2);
            
              if (ultimos_tres_digitos === primerasTresLetras) {
                  datss.id_banco = this.listaBancos[i].id_banco;
                break
              }
            }
            if(datss.id_banco==null|| datss.id_banco==0){
              this.openSnackBar('Verifique el banco si existe', 'Aviso');
            }else{
            this.infoCuentaClabeService.guardarEnLatablaListarPagos(datss).pipe(
              catchError((error) => {
                this.openSnackBar('Error Alta de la cuenta', 'Aviso');
                return of(null);
              })
            ).subscribe(data => {
              let res = { "peiyu": this.localStorageService.getUsuario("pblu") }
              this.infoCuentaClabeService.listarPagosDeAutorizarPblu(res).subscribe(date => {
                this.cuentas = date;
                for (let i = 0; i < this.cuentas.length; i++) {
                  this.cuentas[i];
                  for (let j = 0; j < this.listaBancos.length; j++) {
                    if (this.cuentas[i].id_banco === this.listaBancos[j].id_banco) {
                      this.cuentas[i].bancoNombre = this.listaBancos[j].descripcion;
                    }
                  }
                }
                this.seleccionado="";
                this.dataSource = new MatTableDataSource<InfoCuentaClabe>(this.cuentas);
              })
            })
          }
          }
        } else {
          this.openSnackBar("No se puede agregar esta cuenta  ", "Aviso");
        }
      } else {
        this.openSnackBar("Excede el máximo de cuentas permitidas", "Aviso");
      }
    } else {
      this.openSnackBar("Número de cuenta incorrecto", "Aviso");
    }
  }
  mostrarContenidoCopiado2(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    const onlyNumbers = pastedText.replace(/[^0-9]/g, ''); // Elimina todos los caracteres no numéricos
    // Actualiza el valor del campo de entrada solo con los números pegados
    this.seleccionado = onlyNumbers;
  }
  
  modificar() {
    let datoAe=new InfoCuentaClabe;
    datoAe.id = this.datoAeditar.id;
    datoAe.pblu=this.datoAeditar.pblu;
    let datoseleccionado: string = this.seleccionado;
    if (datoseleccionado.length > 17) {
      if (datoseleccionado != "") {
        datoAe.cuentaClabe = datoseleccionado;
        if (this.clabeMadre !=datoAe.cuentaClabe) {
          let primerasTresLetras: string = datoseleccionado.substring(0, 3);
          for (let i = 0; i < this.listaBancos.length; i++) {
            var ultimos_tres_digitos =  this.listaBancos[i].id_banco.toString().substr(2);
          
            if (ultimos_tres_digitos === primerasTresLetras) {
              datoAe.id_banco = this.listaBancos[i].id_banco;
              break
            }
          }
          
          if(datoAe.id_banco ==null|| datoAe.id_banco ==0){
            this.openSnackBar('La cuenta no existe', 'Aviso');
          }else{
          this.infoCuentaClabeService.modificar(datoAe).subscribe(data => {
            this.infoCuentaClabeService.listarPagosDeAutorizar().subscribe(datas => {
              this.infoCuentaClabeService.listaCuentaNueva.next(datas);
              this.listarNuevo();
              this.mensajeDeValidacion = "";
            });
          });
          }
        } else {
          this.openSnackBar("No se puede Modificar a esta cuenta  ", "Aviso");
          return;
        }

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
      duration: 6000,
    });
  }
  openSnackBar2(da1: string, da2: string) {
    this._snackBar.open(da1, da2, {
      duration: 7000,
    });
  }
  validarSoloNumeros(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.keyCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  eliminar(element: InfoCuentaClabe) {
    if (this.mensajeDeValidacion == "Otp validado correctamente") {
      this.infoCuentaClabeService.eliminar(element).subscribe(data => {
        this.openSnackBar("Eliminado correctamente", "Aviso");
        this.infoCuentaClabeService.listarPagosDeAutorizar().subscribe(datas => {
          this.infoCuentaClabeService.listaCuentaNueva.next(datas);
          this.listarNuevo();
          this.mensajeDeValidacion = "";
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
