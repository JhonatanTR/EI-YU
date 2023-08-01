import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { Cliente } from 'src/app/_model/cliente';
import { InfoBancos } from 'src/app/_model/InfoBancos';
import { InfoBancosService } from 'src/app/_service/info-bancos.service';
import { startWith, map, catchError } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { InfoCuenta } from 'src/app/_model/InfoCuenta';
import { InfoCapturaSPEI } from 'src/app/_model/InfoCapturaSPEI';
import { InfoCapturaSPEIPago } from 'src/app/_model/InfoCapturaSPEIPago';
import { InfoPagosService } from 'src/app/_service/info-pagos.service';
import { InfoAutorizarSpei } from 'src/app/_model/InfoAutorizarSpei';
import { requesteClaveRastreo } from 'src/app/_modelRequest/requestClaveRastreo';
import { requestOtp } from 'src/app/_modelRequest/requestOtp';
import { InfoLoginService } from 'src/app/_service/info-login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InfoSpei } from 'src/app/_model/InfoSpei';
import { of } from 'rxjs';
import { InfoCuentaclabeService } from 'src/app/_service/info-cuentaclabe.service';
import { InfoCuentaClabe } from 'src/app/_model/InfoCuentaClabe';

@Component({
  selector: 'app-enviar-pago',
  templateUrl: './enviar-pago.component.html',
  styleUrls: ['./enviar-pago.component.css']
})

export class EnviarPagoComponent implements OnInit {

  listaBancos: InfoBancos[] = [];//Lista de los bancos de la base de datos
  listaCuentas: InfoCuenta[] = [];//LISTA DE LAS CUENTAS DE LA BASE DE DATOS
  institucionSeleccionada!: InfoBancos; //la institucion que selecciono el cliente
  cuentaSeleccionada: InfoCuenta | undefined;//la institucion que selecciono el cliente
  monto!: number;
  iva: string = "";
  claveDeRastreo = "";
  conceptoPago: string = "";
  refNumerica: string = "";
  cobranza: string = "";
  nomBeneficiario: string = "";
  rfcBeneficiario: string = "";
  destinatario: string = "";
  codigoOtp: string = "";
  cliente!: Cliente;
  numeroDeCuenta: string = "";
  filteredBancos: any[] = [];//aqui se almacenan los filtros de banco
  filteredCuentas: any[] = [];//aqui se almacenan los filtros de las cuentas
  institucionControl = new FormControl();
  cuentasControl = new FormControl();
  adm = false;
  cuentas: InfoCuentaClabe[] = [];
  constructor(private infoCuentaClabeService: InfoCuentaclabeService, private localStorageService: LocalStorageService, private _snackBar: MatSnackBar, private dialog: MatDialog, private storage: LocalStorageService, private infoBancoService: InfoBancosService, private infoPagos: InfoPagosService, private enlistarSpei: InfoPagosService, private infoLoginService: InfoLoginService) {
  }
  clabeMadre = "";
  ngOnInit(): void {
    this.listarBanco();
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
    this.generadorDeClave();//Metodo generador de clave de rastreo
    if (this.localStorageService.getDat("rol")) {
      this.adm = false;
    } else {
      this.adm = true;
    }
    this.listarCuentasClabes();
    this.localStorageService.removeExecel();
  }

  listarCuentasClabes() {//Lista las cuentas clabes que tenemos en configuraciíon de cuenta
    let res = { "peiyu": this.localStorageService.getUsuario("pblu") }
    this.infoCuentaClabeService.listarPagosDeAutorizarPblu(res).pipe(
      catchError((error) => {
        this.openSnackBar('Se produjo un error de conexión. Por favor, inténtelo de nuevo más tarde.', 'Aviso');
        return of([]);
      })).subscribe(data => {
        this.cuentas = data;
      })
  }
  validarNumeroCuenta(event: any): void {
    const keyCode = event.keyCode || event.which;
    const tecla = String.fromCharCode(keyCode);
    const expresionRegular = /^[0-9]+$/;
    if (!expresionRegular.test(tecla) && keyCode !== 8 && keyCode !== 46) {
      event.preventDefault(); // Evitar la inserción de caracteres no numéricos en el campo de cuenta
    }
  }

  cuentaNoPuede = false; // Variable para indicar si la cuenta no puede ser utilizada

  separarNumeros(event: any) {
    let ivaCantidad = event.target.value.replace(/[^0-9\.]/g, ''); // Eliminar caracteres no numéricos del valor
    let numero = event.target.value.replace(/[^0-9\.]/g, ''); // Eliminar caracteres no numéricos del valor
    let parts = numero.split('.'); // Dividir el número en partes separadas por puntos
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Agregar comas para separar los miles
    if (parts.length === 2) {
      let decimalPart = parts[1];
      if (decimalPart.length > 2) {
        decimalPart = decimalPart.slice(0, 2); // Limitar a 2 decimales
      }
      parts[1] = decimalPart;
    }
    event.target.value = parts.join('.'); // Unir las partes del número con un punto nuevamente
    let ivaSinFor = parseFloat((ivaCantidad * 0.16).toFixed(2));
    this.separarIva(ivaSinFor); // Llamar a la función para separar y formatear el valor del IVA
  }

  separarIva(iva: number) {
    const numero = iva;
    const opciones = { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true };
    const numeroFormateado = numero.toLocaleString('en-US', opciones); // Formatear el número con coma para separar los miles y 2 decimales
    this.iva = (numeroFormateado); // Establecer el valor formateado del IVA
  }

  seleccionarBanco(e: any) {
    this.institucionSeleccionada = e.option.value; // Establecer el valor seleccionado del banco

  }

  seleccionarCuenta(e: any) {
    this.cuentaSeleccionada = e.option.value; // Establecer el valor seleccionado de la cuenta
  }
  seleccionManual: boolean = false;

  validarSeleccionManual() {
    this.seleccionManual = this.cuentasControl.value !== null && this.cuentasControl.value !== '';
  }


  displayIB(val: InfoBancos) {
    return val ? `${val.descripcion}` : val; // Devolver la descripción del banco o el valor original si es nulo
  }

  displayCu(vale: InfoCuenta) {
    return vale ? `${vale.clabe}` : vale; // Devolver la CLABE de la cuenta o el valor original si es nulo
  }


  filtradorBanco() {
    this.filteredBancos = this.listaBancos.slice(); // Copiar la lista de bancos
    this.institucionControl.valueChanges.pipe(startWith(''),
      map(value => this._filterBancos(value))
    )
      .subscribe(filteredBancos => {

        this.filteredBancos = filteredBancos; // Filtrar la lista de bancos en base al valor ingresado en el campo de búsqueda
      });
  }
  filtradorCuenta() {
    this.filteredCuentas = this.listaCuentas.slice();
    this.cuentasControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filteCuenta(value))
      )
      .subscribe(filteredCuentase => {
        this.filteredCuentas = filteredCuentase;
      });
  }
  private _filterBancos(value: string): any[] {
    const str = String(value); // Convertir la variable event en una cadena de texto
    const filterValue = str.toLowerCase();
    return this.listaBancos.filter(banco => banco.descripcion.toLowerCase().includes(filterValue));
  }
  private _filteCuenta(value: string): any[] {
    const str = String(value); // Convertir la variable event en una cadena de texto
    const filterValue = str.toLowerCase();
    return this.listaCuentas.filter(cuenta => cuenta.clabe.toLowerCase().includes(filterValue));
  }

  listarBanco() {//aqui se carga la lista de los bancos disponibles
    this.infoBancoService.listar().subscribe(bancos => {
      this.listaBancos = bancos;
      this.filtradorBanco();
    })
    let res = { "peiyu": this.localStorageService.getUsuario("pblu") }
    this.infoBancoService.listarCuenta(res).subscribe(cuentas => {
      this.listaCuentas = cuentas;
      this.filtradorCuenta();
    })
  }


  mayusculas(event: any) {
    this.claveDeRastreo = event.toUpperCase();
  }

  mostrarContenidoCopiado(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    const onlyNumbers = pastedText.replace(/[^0-9]/g, ''); // Elimina todos los caracteres no numéricos
    // Actualiza el valor del campo de entrada solo con los números pegados
    this.destinatario = onlyNumbers;
    if (clipboardData && clipboardData.types.includes('text/plain')) {
      const copiedContent = clipboardData.getData('text/plain');
      let primerasTresLetras: string = copiedContent.substring(0, 3);
      for (const bancos of this.listaBancos) {
        var ultimos_tres_digitos = bancos.id_banco.toString().substr(2);
        if (ultimos_tres_digitos === primerasTresLetras) {
          for (const bancosList of this.listaBancos) {
            if (bancosList.descripcion === bancos.descripcion) {
              this.institucionSeleccionada = bancosList;
              this.institucionControl.setValue(this.institucionSeleccionada);
            }
          }
        } else {
        }
      }
    }
  }
  mostrarContenidoCopiado2(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    const onlyNumbers = pastedText.replace(/[^0-9]/g, ''); // Elimina todos los caracteres no numéricos
    // Actualiza el valor del campo de entrada solo con los números pegados
    this.numeroDeCuenta = onlyNumbers;
  }
  enviar() {//Envia los datos
    if (this.cuentasControl.value?.clabe == undefined) {
      this.numeroDeCuenta = this.cuentasControl.value
    } else {
      this.numeroDeCuenta = this.cuentasControl.value.clabe;
    }
    if (this.clabeMadre != this.numeroDeCuenta.toString().trim()) {
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
          this.codigoOtp = "";
          let m: any = this.monto
          m = m.replace(/,/g, '');
          let speiout = new InfoCapturaSPEIPago();
          speiout.username = InfSpei.username;
          speiout.password = InfSpei.password;
          speiout.certificado = InfSpei.certificado;
          speiout.llave = InfSpei.llave;
          speiout.phrase = InfSpei.phrase;
          speiout.bancoDestino = this.institucionControl.value.id_banco.toString();
          speiout.ctaDestino = this.destinatario.toString();
          speiout.nombreDestino = this.nomBeneficiario;
          speiout.clabe = this.numeroDeCuenta.toString();
          speiout.monto = m;
          speiout.refNum = this.refNumerica;
          // speiout.refCobranza = this.cobranza;
          speiout.cveRastreo = this.claveDeRastreo;
          speiout.conceptoPago = this.conceptoPago;

          this.infoPagos.realizarPago(speiout).pipe(
            catchError((error) => {
              this.openSnackBar('Error al generar la operación, Intente nuevamente', 'Aviso');
              // Aquí puedes realizar las acciones necesarias en caso de error
              return of(null); // Devuelve un observable vacío o un valor por defecto en caso de error
            })
          ).subscribe((data) => {
            if (data) {
              this.limpiar();
              this.openSnackBar('Pago realizado', 'Aviso');
            }
          });
          //aqui se almacena a la base de datos
        } else {
          this.codigoOtp = "";
        }
      })
    } else {
      this.openSnackBar('No se puede realizar el spei desde una cuenta concentradora', 'Aviso');
    }
  }
  openSnackBar(da1: string, da2: string) {//snakBar que se abre cuando se manda a llamar
    this._snackBar.open(da1, da2, {
      duration: 6000,
    });
  }
  estadoBotonRegistrar() {
    return (this.institucionSeleccionada === null || this.monto <= 0 || this.claveDeRastreo == "" || this.conceptoPago === "" || this.refNumerica === "" || this.nomBeneficiario === "" || this.destinatario === "" || this.codigoOtp === "");
  }
  estadoBotonRegistrarEnlis() {
    return (this.institucionSeleccionada === null || this.monto <= 0 || this.claveDeRastreo == "" || this.conceptoPago === "" || this.refNumerica === "" || this.nomBeneficiario === "" || this.destinatario === "");
  }
  mostrarValorCampo(event: any): void {
    let dat = event.target.value.toString();
    if (dat.length == 3) {
      for (const bancos of this.listaBancos) {
        var ultimos_tres_digitos = bancos.id_banco.toString().substr(2);
        if (ultimos_tres_digitos === dat) {
          for (const bancosList of this.listaBancos) {
            if (bancosList.descripcion === bancos.descripcion) {
              this.institucionSeleccionada = bancosList;
              this.institucionControl.setValue(this.institucionSeleccionada);
            }
          }
        } else {
        }
      }

    } else if (dat.length < 3) {
      this.institucionControl.setValue("");
    }
  }

  generadorDeClave() {
    let request = new requesteClaveRastreo();
    request.idParticipante = this.localStorageService.getUsuario("pblu").toString();
    this.infoBancoService.generarClaveRastreo(request).subscribe(data => {
      this.claveDeRastreo = data.claveRastreo;
    });
  }
  formatRFC(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length > 13) {
      value = value.substr(0, 13);
    }
    const firstPart = value.substr(0, 4);
    const secondPart = value.substr(4, 6);
    const thirdPart = value.substr(10, 3); // Aquí corregimos el tercer parámetro
    this.rfcBeneficiario = `${firstPart}-${secondPart}-${thirdPart}`;

    // Si el input está vacío y rfcBeneficiario no es nulo, borra su contenido
    if (input.value === '' && this.rfcBeneficiario) {
      this.rfcBeneficiario = "";
    }
  }

  Listspeiout: InfoCapturaSPEI[] = [];
  enlistarSPEIOUT() {
    if (this.cuentasControl.value?.clabe == undefined) {
      this.numeroDeCuenta = this.cuentasControl.value;
    } else {
      this.numeroDeCuenta = this.cuentasControl.value.clabe;
    }

    if (this.clabeMadre != this.numeroDeCuenta.toString().trim()) {
      let m: any = this.monto
      m = m.replace(/,/g, '');
      let dataBaseSPEI = new InfoAutorizarSpei();
      dataBaseSPEI.pblu = this.localStorageService.getUsuario("pblu");
      dataBaseSPEI.destino = this.destinatario;
      dataBaseSPEI.beneficiario = this.nomBeneficiario;
      dataBaseSPEI.numerodecuenta = this.cuentasControl.value;
      dataBaseSPEI.banco = this.institucionSeleccionada.descripcion;
      dataBaseSPEI.monto = parseFloat(m);
      dataBaseSPEI.refnumerica = this.refNumerica;
      dataBaseSPEI.claberastreo = this.claveDeRastreo;
      dataBaseSPEI.conceptopago = this.conceptoPago;
      dataBaseSPEI.id_usuario = this.localStorageService.getDesc("usuario");
      if (this.localStorageService.getDesc("idRol") != '3') {
        if (this.localStorageService.getDat("rol")) {
          dataBaseSPEI.id_rol = 1;
        } else {
          dataBaseSPEI.id_rol = 2;

        }
      } else {
        dataBaseSPEI.id_rol = 2;
      }
      this.enlistarSpei.guardarEnLatablaListarPagos(dataBaseSPEI).subscribe(data => {
        this.openSnackBar('Enlistado correctamente', 'Aviso');
      })
      this.limpiar()
      this.generadorDeClave();
    } else {
      this.openSnackBar('No se puede realizar el spei desde una cuenta concentradora', 'Aviso');
    }
  }
  limpiar() {
    this.destinatario = "";
    this.nomBeneficiario = "";
    this.numeroDeCuenta = "";
    this.monto = 0;
    this.refNumerica = "";
    this.cobranza = "";
    this.generadorDeClave();
    this.conceptoPago = "";
  }
  isInputInvalid = false;
  validateInput(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9]*$/;
    const inputChar = String.fromCharCode(event.keyCode);
    // Permitir teclas numéricas del teclado numérico y del teclado alfanumérico
    if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
      return;
    }
    if (!pattern.test(inputChar)) {
      event.preventDefault();
      this.isInputInvalid = true;
    } else {
      this.isInputInvalid = false;
    }
  }
  limitarMaximo18Digitos(evento: any) {
    const valor = evento.target.value;
    if (valor.length > 18) {
      evento.target.value = valor.slice(0, 18);
    }
  }

  validarSoloNumeros(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.keyCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}

interface Bancos {
  clave: string,
  nomBanco: string
}
