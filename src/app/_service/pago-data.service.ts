import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Pagos } from 'src/app/_model/Pagos';
import { LocalStorageService } from './local-storage.service';
import { InfoPagosService } from './info-pagos.service';
import { Archivo_Eiyu } from '../_model/Archivo_EiYu';

@Injectable({
  providedIn: 'root',
})
export class PagoDataService {
  public pagos: Pagos[] = [];
  public pagosProcesados: Pagos[] = [];
  private localStorageKey = 'pagos';
  private localStorageKey2 = 'archivos';
  pagosUpdated = new Subject<Pagos[]>();
  pagosProcesadosUpdated = new Subject<Pagos[]>();
  archivosProcesadosUpdated = new Subject<Archivo_Eiyu[]>();
  isLoading: boolean = false;
  archivo_Eiyu:Archivo_Eiyu[]=[];


  constructor(private localStorageService: LocalStorageService, private infoPagosService: InfoPagosService,
    ) {
    // Recupera los pagos almacenados del localStorage al inicializar el servicio
    const storedPagos = localStorageService.getPagos(this.localStorageKey);
    if (storedPagos) {
      this.pagos = storedPagos;
    }
    const storedPagosProcesados = localStorageService.getPagos(
      this.localStorageKey2
    );
    if (storedPagosProcesados) {
      this.pagosProcesados = storedPagosProcesados;
    }
  }

  updatePayment(pago: Pagos) {
    this.isLoading = false; // Indicar que la petición ha finalizado
    const index = this.pagos.findIndex((pagoItem) => pagoItem.Id === pago.Id);
    this.pagos[index] = pago;
    this.pagosProcesados.push(pago);
    this.saveToLocalStorage();
    //this.pagosUpdated.next(this.pagos.slice());
    //this.pagosProcesadosUpdated.next(this.pagosProcesados.slice());
  }
  updatePagos(pagos: Pagos[]) {
    this.pagos = pagos;
    this.pagosUpdated.next([...this.pagos]);// Notificar a los suscriptores que el arreglo de pagos ha sido actualizado
    //this.pagosProcesadosUpdated.next(this.pagosProcesados);
    this.localStorageService.setPagos(
      this.localStorageKey2,
      this.pagosProcesados
    );
    //this.pagosProcesados.push(...pagos);
    //this.pagosProcesadosUpdated.next(this.pagosProcesados);
    //this.localStorageService.setPagos(this.localStorageKey2, this.pagosProcesados);
    //this.pagosProcesados = pagos;
    //this.pagosProcesadosUpdated.next([...this.pagosProcesados]); // Notificar a los suscriptores que el arreglo de pagos ha sido actualizado
  }

  // Función para agregar un nuevo pago con duración de 1 hora
  addPaymentWithExpiration(pago: Pagos, idPago: number) {
    const expirationDate = new Date().getTime() + 10000; // 1 hora en milisegundos (3600000 ms = 1 hora)
    this.isLoading = true; // Indicar que hay una petición en curso
    this.pagos.push(pago);
    this.pagos.sort((a, b) => b.Id - a.Id);
    this.saveToLocalStorage(); // Guarda los pagos en el localStorage

    // Guardar la fecha de vencimiento junto con los datos del pago en el localStorage
    const paymentDataWithExpiration = {
      data: pago,
      expirationDate: expirationDate,
    };
    localStorage.setItem(
      `pago_${idPago}`,
      JSON.stringify(paymentDataWithExpiration)
    );

    // Configurar el temporizador para eliminar el pago después de 1 hora
    setTimeout(() => {
      this.isLoading = false; // Indicar que la petición ha finalizado
      this.deletePayment(idPago);
    }, 10000); // 1 hora en milisegundos (3600000 ms = 1 hora)
  }
  async archivosPorParticipante(): Promise<Archivo_Eiyu[]> {
    const p = { pblu: this.localStorageService.getUsuario("pblu") };
    try {
      const data = await this.infoPagosService.archivosPorParticipante(p).toPromise();
      return data!;
    } catch (error) {
      return []; // Devuelve un array vacío en caso de error
    }
  }

  // Función para eliminar un pago por su ID
  async deletePayment(idPago: number) {
    this.isLoading = true; // Indicar que hay una petición en curso
    this.pagos = this.pagos.filter((pago) => pago.Id !== idPago);
    this.saveToLocalStorage(); // Guarda los pagos en el localStorage después de eliminar
    this.pagosUpdated.next(this.pagos.slice());
    this.archivo_Eiyu = await this.archivosPorParticipante();
    this.archivosProcesadosUpdated.next(this.archivo_Eiyu);
    this.localStorageService.setPagos(
      this.localStorageKey2,
      this.pagosProcesados
    );
    this.isLoading = false; // Indicar que la petición ha finalizado
    return true;
  }
  getPagos() {
    return this.pagos;
  }
  isPagoProcessed(idPago: number) {
    const pago = this.pagosProcesados.find((pago) => pago.Id === idPago);
    if (pago) {
      return true;
    } else {
      return false;
    }
  }
  getArchivos() {
    return this.pagosProcesados;
  }

  // Función para guardar los pagos en el localStorage
  private saveToLocalStorage() {
    this.localStorageService.setPagos(this.localStorageKey, this.pagos);
  }
  // Método para obtener el último ID del último pago
  getLastPaymentId(): number {
    if (this.pagos.length > 0) {
      const lastPayment = this.pagos.length;
      return lastPayment;
    } else {
      return 0; // Si el arreglo está vacío, devuelve 0 como ID inicial
    }
  }
}
