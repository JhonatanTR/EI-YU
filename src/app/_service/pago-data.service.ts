import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Pagos } from 'src/app/_model/Pagos';

@Injectable({
  providedIn: 'root',
})
export class PagoDataService {
  public pagos: Pagos[] = [];
  private localStorageKey = 'pagos';
  pagosUpdated = new Subject<Pagos[]>();
  isLoading: boolean = false;


  constructor() {
    // Recupera los pagos almacenados del localStorage al inicializar el servicio
    const storedPagos = localStorage.getItem(this.localStorageKey);
    if (storedPagos) {
      this.pagos = JSON.parse(storedPagos);
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
    this.isLoading = true; // Indicar que hay una petición en curso
    this.pagos.push(pago);
    this.pagos.sort((a, b) => b.Id - a.Id);
    this.saveToLocalStorage(); // Guarda los pagos en el localStorage

    // Configurar el temporizador para eliminar el pago después de 1 hora
    setTimeout(() => {
      this.isLoading = false; // Indicar que la petición ha finalizado
      this.deletePayment(idPago);
    }, 100000); // 1 hora en milisegundos (3600000 ms = 1 hora)
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
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.pagos));
  }
}
