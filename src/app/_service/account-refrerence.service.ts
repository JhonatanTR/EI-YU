import { Injectable } from '@angular/core';
import { HOSTCUENTAS } from '../_shared/var.constant';
import { requestPersonaFisica } from '../_modelRequest/modeloCuenta/requestPersonaFisica';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountRefrerenceService {
  url: string = `${HOSTCUENTAS}/crearCuenta`
  constructor(private http: HttpClient) { }

  crearCuenta(request: requestPersonaFisica) {//Movimientos realizado por los clientes
    return this.http.post<any>(`${this.url}/cuenta`, request);
  }
}
