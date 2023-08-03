import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto'
import { PagoAbonoSaldo } from 'src/app/_model/InfoPAS';
import { InfoBancosService } from 'src/app/_service/info-bancos.service';
import { LocalStorageService } from 'src/app/_service/local-storage.service';
import { interval, Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InfoLoginService } from 'src/app/_service/info-login.service';
import { LoginService } from 'src/app/_service/login.service';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  isChecked = true; // Variable que indica si una opción está marcada o no
  selectedDate: string = ""; // Variable para almacenar una fecha seleccionada
  datosTabla = [ // Arreglo de datos para una tabla
    { columna1: 'Unidad de negocio de prueba ', columna2: '$0.00', columna3: '$0.00', columna4: '$0.00', columna5: '$0.00' }
  ];
  dato: boolean = true; // Variable de tipo booleano para almacenar un valor de verdadero o falso
  chart: any = null; // Variable para almacenar un gráfico, de tipo "any" para permitir cualquier tipo de valor
  chart2: any = null; // Variable para almacenar otro gráfico
  tipo: string = ""; // Variable para almacenar un tipo de dato en forma de cadena de caracteres
  pas !: PagoAbonoSaldo; // Variable de tipo "PagoAbonoSaldo", debe ser inicializada antes de ser utilizada
  fechaInicio!: Date; // Variable de tipo "Date" para almacenar una fecha de inicio, debe ser inicializada antes de ser utilizada
  fechaFinal!: Date; // Variable de tipo "Date" para almacenar una fecha final, debe ser inicializada antes de ser utilizada
  fechaActual!: Date; // Variable de tipo "Date" para almacenar la fecha actual, debe ser inicializada antes de ser utilizada
  token: string = ""; // Variable de tipo "string" para almacenar un token en forma de cadena de caracteres
  sn: string = "0.00"; // Variable de tipo "string" para almacenar un número en forma de cadena de caracteres, con valor inicial de "0.00"
  pblu: string = this.localStorageService.getUsuario("pblu").toString();//Almacena el idPblu del participante
  intervalSubscription: Subscription | null = null;
  data: number = 15000;
  ocult= false;
  pbluParaSaldo={
   "pblu": this.localStorageService.getUsuario("pblu")
  }
  constructor(private loginService: LoginService, private infoLog: InfoLoginService, private Infob: InfoBancosService, private localStorageService: LocalStorageService) {
    this.fechaActual = new Date();
    this.fechaInicio = new Date;
    this.fechaFinal = new Date;
    this.pas = new PagoAbonoSaldo();
  }

  ngOnInit(): void {
    this.infoLog.saldoACTUAL(this.pbluParaSaldo).subscribe((saldo:any) => {
      this.sn = saldo;
    })
    const datePipe = new DatePipe('en-US');
    //this.startDataUpdate();
    let ini = datePipe.transform(this.fechaActual, 'yyyy-MM-dd');
    let dat = {
      "idPblu": this.localStorageService.getUsuario("pblu").toString(),
      "fechaInicio": ini,
      "fechaFinal": ini
    }
    this.Infob.PagoAbonoSaldo(dat).subscribe(dato => {
      this.pas = dato;
    });

    this.loginService.mensaje$.subscribe((mensaje: string) => {
      this.token = mensaje;
    });

    this.token = this.localStorageService.getDesc("token")
    this.tipo = "bar"
    //this.dibujar();
    //this.dibujar2();
  }
  ngOnDestroy(): void {//Cuando sale del este pagina destruye todo proceso que este haciendo internamente en este caso el resultado de tiempo real deja de consultarse
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
  empezar() {//Este metodo depende de que si el check esta habilitado o npo ya que si esta hablilitado empiza hacer la consulta y si no deja de hacer la consulta
    /*if (this.isChecked) {
      this.stopDataUpdate();
    } else if (this.isChecked == false) {
      this.startDataUpdate();
    }*/
    this.showSaldoActual();
  }
  showSaldoActual(){
    const datePipe = new DatePipe('en-US');
        this.infoLog.saldoACTUAL(this.pbluParaSaldo).subscribe(sal => {
          this.sn = sal;
        })
  }
  startDataUpdate(): void {// Iniciamos el intervalo de 15 segundos y nos suscribimos a él
    const datePipe = new DatePipe('en-US');
    let ini = datePipe.transform(this.fechaActual, 'yyyy-MM-dd');
    let dat = {
      "idPblu": this.pblu,
      "fechaInicio": ini,
      "fechaFinal": ini
    }
    this.intervalSubscription = interval(this.data).subscribe(() => {
      this.Infob.PagoAbonoSaldo(dat).subscribe(dato => {
        this.pas = dato;
        let to ={"token":this.token}
        this.infoLog.saldoACTUAL(this.pbluParaSaldo).subscribe(sal => {
          this.sn = sal;
        })
      });
    });
  }
  stopDataUpdate(): void {//para el proceso de consulta para realizar otra consulta filtrada por fecha
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = null; // Restablecer la variable a null
    }
  }
  elegir(da: any) {//Realiza el primer filtrado dependiendo de la primer fecha elegida
    const datePipe = new DatePipe('en-US');
    let ini = datePipe.transform(this.fechaInicio, 'yyyy-MM-dd');
    let fin = datePipe.transform(da, 'yyyy-MM-dd');
    let dat = {
      "idPblu": this.localStorageService.getUsuario("pblu").toString(),
      "fechaInicio": ini,
      "fechaFinal": fin
    }
    this.Infob.PagoAbonoSaldo(dat).subscribe(dato => {
      this.pas = dato;
    });
  }
  elegir2(da: any) {//Realiza el segundo filtrado dependiendo de la segunda fecha elegida
    const datePipe = new DatePipe('en-US');
    let ini = datePipe.transform(da, 'yyyy-MM-dd');
    let fin = datePipe.transform(this.fechaFinal, 'yyyy-MM-dd');
    let dat = {
      "idPblu": this.localStorageService.getUsuario("pblu").toString(),
      "fechaInicio": ini,
      "fechaFinal": fin
    }
    this.Infob.PagoAbonoSaldo(dat).subscribe(dato => {
      this.pas = dato;
    });
  }
  //Este es una grafica de barra comentada
  /* dibujar() {
     this.chart = new Chart('canvas', {
       type: 'pie',
       data: {

         labels: ['Participante 1', 'Participante 2', 'Participante 3', 'Participante 4', 'Participante 5', 'Participante 6'],
         datasets: [{
           label: '# of Votes',
           data: [12, 19, 3, 5, 2, 3],
           backgroundColor: [
             '#ff6961',
             '#84b6f4',
             '#fdfd96',
             '#77dd77',
             '#e79eff',
             '#ffda9e'
           ],
           borderColor: [
             'rgba(255, 99, 132, 1)',
             'rgba(54, 162, 235, 1)',
             'rgba(255, 206, 86, 1)',
             'rgba(75, 192, 192, 1)',
             'rgba(153, 102, 255, 1)',
             'rgba(255, 159, 64, 1)'
           ],
           borderWidth: 1
         }]
       },
       options: {
         scales: {

         },

       }
     });

   }
   dibujar2() {

     this.chart2 = new Chart('canvas2', {

       type: 'bar',
       data: {
         labels: ['Participante 1', 'Participante 2', 'Participante 3', 'Participante 4', 'Participante 5', 'Participante 6'],
         datasets: [{
           label: '# of Votes',
           data: [12, 19, 3, 5, 2, 3],
           backgroundColor: [
             '#ff6961',
             '#84b6f4',
             '#fdfd96',
             '#77dd77',
             '#e79eff',
             '#ffda9e'
           ],
           borderColor: [
             'rgba(255, 99, 132, 1)',
             'rgba(54, 162, 235, 1)',
             'rgba(255, 206, 86, 1)',
             'rgba(75, 192, 192, 1)',
             'rgba(153, 102, 255, 1)',
             'rgba(255, 159, 64, 1)'
           ],
           borderWidth: 1
         }]
       },
       options: {

         scales: {

         }
       }
     });

   }*/

}



