import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Pagos } from 'src/app/_model/Pagos';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class PagoDataService {
  public pagos: Pagos[] = [];
  private localStorageKey = 'pagos';
  pagosUpdated = new Subject<Pagos[]>();
  isLoading: boolean = false;

  constructor(private localStorageService: LocalStorageService) {
    // Recupera los pagos almacenados del localStorage al inicializar el servicio
    const storedPagos = localStorageService.getPagos(this.localStorageKey);
    if (storedPagos) {
      this.pagos = storedPagos;
    }
  }

  updatePayment(pago: Pagos) {
    this.isLoading = false; // Indicar que la petición ha finalizado
    const index = this.pagos.findIndex((pagoItem) => pagoItem.Id === pago.Id);
    this.pagos[index] = pago;
    this.saveToLocalStorage();
    this.pagosUpdated.next(this.pagos.slice());
  }
  updatePagos(pagos: Pagos[]) {
    this.pagos = pagos;
    this.pagosUpdated.next([...this.pagos]); // Notificar a los suscriptores que el arreglo de pagos ha sido actualizado
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

  // Función para eliminar un pago por su ID
  deletePayment(idPago: number) {
    this.isLoading = true; // Indicar que hay una petición en curso
    this.pagos = this.pagos.filter((pago) => pago.Id !== idPago);
    this.saveToLocalStorage(); // Guarda los pagos en el localStorage después de eliminar
    this.pagosUpdated.next(this.pagos.slice());
    this.isLoading = false; // Indicar que la petición ha finalizado
  }
  getPagos() {
    return this.pagos;
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
