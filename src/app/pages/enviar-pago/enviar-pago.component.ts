import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogoComponent } from './dialogo/dialogo.component';
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
  bancosConstante: Bancos[] = [
    { clave: '002', nomBanco: 'BANAMEX' },
    { clave: '006', nomBanco: 'BANCOMEXT' },
    { clave: '009', nomBanco: 'BANOBRAS' },
    { clave: '012', nomBanco: 'BBVA BANCOMER' },
    { clave: '014', nomBanco: 'SANTANDER' },
    { clave: '019', nomBanco: 'BANJERCITO' },
    { clave: '021', nomBanco: 'HSBC' },
    { clave: '030', nomBanco: 'BAJÍO' },
    { clave: '036', nomBanco: 'INBURSA' },
    { clave: '042', nomBanco: 'MIFEL' },
    { clave: '044', nomBanco: 'SCOTIABANK' },
    { clave: '058', nomBanco: 'BANREGIO' },
    { clave: '059', nomBanco: 'INVEX' },
    { clave: '060', nomBanco: 'BANSI' },
    { clave: '062', nomBanco: 'AFIRME' },
    { clave: '072', nomBanco: 'BANORTE' },
    { clave: '106', nomBanco: 'BANK OF AMERICA' },
    { clave: '108', nomBanco: 'MUFG' },
    { clave: '110', nomBanco: 'JP MORGAN' },
    { clave: '112', nomBanco: 'BMONEX' },
    { clave: '113', nomBanco: 'VE POR MAS' },
    { clave: '126', nomBanco: 'CREDIT SUISSE' },
    { clave: '127', nomBanco: 'AZTECA' },
    { clave: '128', nomBanco: 'AUTOFIN' },
    { clave: '129', nomBanco: 'BARCLAYS' },
    { clave: '130', nomBanco: 'COMPARTAMOS' },
    { clave: '132', nomBanco: 'MULTIVA BANCO' },
    { clave: '133', nomBanco: 'ACTINVER' },
    { clave: '135', nomBanco: 'NAFIN' },
    { clave: '136', nomBanco: 'INTERCAM BANCO' },
    { clave: '137', nomBanco: 'BANCOPPEL' },
    { clave: '138', nomBanco: 'ABC CAPITAL' },
    { clave: '140', nomBanco: 'CONSUBANCO' },
    { clave: '141', nomBanco: 'VOLKSWAGEN' },
    { clave: '143', nomBanco: 'CIBanco' },
    { clave: '145', nomBanco: 'BBASE' },
    { clave: '147', nomBanco: 'BANKAOOL' },
    { clave: '148', nomBanco: 'PagaTodo' },
    { clave: '150', nomBanco: 'INMOBILIARIO' },
    { clave: '151', nomBanco: 'Donde' },
    { clave: '152', nomBanco: 'BANCREA' },
    { clave: '154', nomBanco: 'BANCO COVALTO' },
    { clave: '155', nomBanco: 'ICBC' },
    { clave: '156', nomBanco: 'SABADELL' },
    { clave: '157', nomBanco: 'SHINHAN' },
    { clave: '158', nomBanco: 'MIZUHO BANK' },
    { clave: '159', nomBanco: 'BANK OF CHINA' },
    { clave: '160', nomBanco: 'BANCO S3' },
    { clave: '166', nomBanco: 'Banco del Bienestar' },
    { clave: '168', nomBanco: 'HIPOTECARIA FEDERAL' },
    { clave: '600', nomBanco: 'MONEXCB' },
    { clave: '601', nomBanco: 'GBM' },
    { clave: '602', nomBanco: 'MASARI CB' },
    { clave: '605', nomBanco: 'VALUÉ' },
    { clave: '608', nomBanco: 'VECTOR' },
    { clave: '610', nomBanco: 'B&B' },
    { clave: '613', nomBanco: 'MULTIVA CBOLSA' },
    { clave: '616', nomBanco: 'FINAMEX' },
    { clave: '617', nomBanco: 'VALMEX' },
    { clave: '618', nomBanco: 'ÚNICA' },
    { clave: '619', nomBanco: 'MAPFRE' },
    { clave: '620', nomBanco: 'PROFUTURO' },
    { clave: '621', nomBanco: 'CB ACTINBER' },
    { clave: '622', nomBanco: 'OACTIN' },
    { clave: '623', nomBanco: 'SKANDIA' },
    { clave: '626', nomBanco: 'CBDEUTSCHE' },
    { clave: '627', nomBanco: 'ZURICH' },
    { clave: '628', nomBanco: 'ZURICHVI' },
    { clave: '629', nomBanco: 'SU CASITA' },
    { clave: '630', nomBanco: 'C.B. INTERCAM' },
    { clave: '631', nomBanco: 'C.I. BOLSA' },
    { clave: '632', nomBanco: 'BULLTICK C.B.' },
    { clave: '633', nomBanco: 'STERLING' },
    { clave: '634', nomBanco: 'FINCOMUN' },
    { clave: '636', nomBanco: 'HDI SEGUROS' },
    { clave: '637', nomBanco: 'ORDER' },
    { clave: '638', nomBanco: 'AKALA' },
    { clave: '640', nomBanco: 'C.B. JP MORGAN' },
    { clave: '642', nomBanco: 'REFORMA' },
    { clave: '646', nomBanco: 'STP' },
    { clave: '647', nomBanco: 'TELECOMM' },
    { clave: '648', nomBanco: 'EVERCORE' },
    { clave: '649', nomBanco: 'SKANDIA' },
    { clave: '651', nomBanco: 'SEGMTY' },
    { clave: '652', nomBanco: 'ASEA' },
    { clave: '653', nomBanco: 'KUSPIT' },
    { clave: '655', nomBanco: 'SOFIEXPRESS' },
    { clave: '656', nomBanco: 'UNAGRA' },
    { clave: '659', nomBanco: 'OPCIONES EMPRESARIALES DEL NOROESTE' },
    { clave: '670', nomBanco: 'LIBERTAD' },
    { clave: '674', nomBanco: 'AXA' },
    { clave: '677', nomBanco: 'CAJA POP MEXICA' },
    { clave: '679', nomBanco: 'FND' },
    { clave: '684', nomBanco: 'TRANSFER' },
    { clave: '901', nomBanco: 'CLS' },
    { clave: '902', nomBanco: 'INDEVAL' },
    { clave: '999', nomBanco: 'N/A' },
    { clave: '860', nomBanco: 'Banxico Beta' },
  ];
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


  ngOnInit(): void {
    this.listarBanco();
    this.generadorDeClave();//Metodo generador de clave de rastreo
    if (this.localStorageService.getDat("rol")) {
      this.adm = false;
    } else {
      this.adm = true;
    }this.listarCuentasClabes();

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
  
  displayIB(val: InfoBancos) {
    return val ? `${val.descripcion}` : val; // Devolver la descripción del banco o el valor original si es nulo
  }
  
  displayCu(vale: InfoCuenta) {
    return vale ? `${vale.clabe}` : vale; // Devolver la CLABE de la cuenta o el valor original si es nulo
  }
  
  filtradorBanco() {
    this.filteredBancos = this.listaBancos.slice(); // Copiar la lista de bancos
    this.institucionControl.valueChanges
      .pipe(
        startWith(''),
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
    this.infoBancoService.listarCuenta(9).subscribe(cuentas => {
      this.listaCuentas = cuentas;
      this.filtradorCuenta();
    })
  }

  openDialog() {//abre el dialgo de carga masiva
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '90%'; // establece el ancho del diálogo al 50% del ancho de la pantalla
    dialogConfig.height = '90%'; // establece la altura del diálogo al 50% del alto de la pantalla
    dialogConfig.maxWidth = '93%'; // establece el ancho máximo del diálogo al 90% del ancho de la pantalla
    dialogConfig.maxHeight = '93%'; // establece la altura máxima del diálogo al 90% del alto de la pantalla
    dialogConfig.disableClose = false; // desactiva la opción de cerrar el diálogo haciendo clic fuera de él
    this.dialog.open(DialogoComponent, dialogConfig);
  }

  mayusculas(event: any) {
    this.claveDeRastreo = event.toUpperCase();
  }

  enviar() {//Envia los datos
    for(let a of this.cuentas){
      if(a.cuentaClabe ==this.numeroDeCuenta){
        this.cuentaNoPuede=true;
      
      }else{
        this.cuentaNoPuede=false;
      }
    
    }
  if(this.cuentaNoPuede ==false){  
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
  }else{
    this.openSnackBar('No se puede realizar el spei desde una cuenta concentradora...', 'Aviso');
  }
  }
  openSnackBar(da1: string, da2: string) {//snakBar que se abre cuando se manda a llamar 
    this._snackBar.open(da1, da2, {
      duration: 2000,
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
      for (const bancos of this.bancosConstante) {
        if (bancos.clave === dat) {
          for (const bancosList of this.listaBancos) {
            if (bancosList.descripcion === bancos.nomBanco) {
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
    let m: any = this.monto
    m = m.replace(/,/g, '');
    let speiout = new InfoCapturaSPEI();
    speiout.destinatario = this.destinatario;
    speiout.nombreBeneficiario = this.nomBeneficiario;
    speiout.numeroCuenta = this.numeroDeCuenta;
    speiout.infoBancos = this.institucionSeleccionada;
    speiout.monto = parseFloat(m);
    speiout.refNumerica = this.refNumerica;
    // speiout.refCobranza = this.cobranza;
    speiout.claveRastreo = this.claveDeRastreo;
    speiout.conceptoPago = this.conceptoPago;
    let dataBaseSPEI = new InfoAutorizarSpei();
    dataBaseSPEI.pblu = this.localStorageService.getUsuario("pblu");
    dataBaseSPEI.destino = this.destinatario;
    dataBaseSPEI.beneficiario = this.nomBeneficiario;
    dataBaseSPEI.numerodecuenta = this.numeroDeCuenta;
    dataBaseSPEI.banco = this.institucionSeleccionada.descripcion;
    dataBaseSPEI.monto = parseFloat(m);
    dataBaseSPEI.refnumerica = this.refNumerica;
    dataBaseSPEI.claberastreo = this.claveDeRastreo;
    dataBaseSPEI.conceptopago = this.conceptoPago;
    this.enlistarSpei.guardarEnLatablaListarPagos(dataBaseSPEI).subscribe(data => {
      this.openSnackBar('Enlistado correctamente', 'Aviso');
    })

    this.limpiar()
    this.generadorDeClave();
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