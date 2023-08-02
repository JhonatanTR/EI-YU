import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Archivos } from '../_model/Archivos';

@Injectable({
  providedIn: 'root'
})
export class ArchivoDataService {
  public archivos: Archivos[] = [];
  archivosUpdated = new Subject<Archivos[]>();

      // Función para agregar un nuevo archivo con duración de 1 día
      addFiletWithExpiration(pago: Pagos, idPago: number) {
        this.pagos.push(pago);
        this.pagos.sort((a, b) => b.Id - a.Id);

        // Configurar el temporizador para eliminar el pago después de 1 hora
        setTimeout(() => {
          this.deletePayment(idPago);
        }, 20000); // 1 hora en milisegundos (3600000 ms = 1 hora)
      }
}
