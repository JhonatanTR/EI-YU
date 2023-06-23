import { Injectable } from '@angular/core';
import { HOST } from '../_shared/var.constant';
import { HttpClient } from '@angular/common/http';
import { InfoBancos } from '../_model/InfoBancos';
import { InfoCuenta } from '../_model/InfoCuenta';
import { RequestMovimientos } from '../_modelRequest/requestMoviento';
import { InfoMovimiento } from '../_model/InfoMovimiento';
import { requestMovientoDetalle } from '../_modelRequest/requestMovimientoDetalle';
import { InfoMovimientoDetalle } from '../_model/InfoMovimientoDetalle';
import { requesteClaveRastreo } from '../_modelRequest/requestClaveRastreo';
import { map } from 'rxjs';
import { PagoAbonoSaldo } from '../_model/InfoPAS';

@Injectable({
  providedIn: 'root'
})
export class InfoBancosService {
  url: string = `${HOST}/bancos`
  urlClaveRastro:string=`${HOST}/claveoRastreo`;
  constructor(private http: HttpClient) { }

  listar() {//Instituciones o bancos disponibles
    return this.http.get<InfoBancos[]>(this.url);
  }
  listarBanco(){
    return this.http.get<InfoBancos[]>(this.url);
  }
  listarCuenta(dato: any) {//Cuentas disponibles
    return this.http.post<InfoCuenta[]>(`${this.url}/cuentasPorP`,dato)
  }

  listarMovientosDelCliente(request: RequestMovimientos) {//Movimientos realizado por los clientes
    return this.http.post<InfoMovimiento[]>(`${this.url}/movimientosPEiyu`, request);
  }

  listarMovientosDetalle(request: requestMovientoDetalle) {//Movimientos realizado por los clientes
    return this.http.post<InfoMovimientoDetalle>(`${this.url}/movimientosDetallePEiyu`, request);
  }

 
  listarMovimientoFiltradosPageable(request: RequestMovimientos,p:number,s:number){//Hace el filtrado de los movientos estos con un tamaño y la pagina 
    return this.http.post<InfoMovimiento[]>(`${this.url}/movimientosPEiyuFiltradoPage?page=${p}&size=${s} `, request)
  }
  generarClaveRastreo(request: requesteClaveRastreo) {//Genera la clabe de rastreo que aparece en la parte de enviar Spei y trasferencia
    return this.http.post<any>(`${this.urlClaveRastro}/obtener`, request)
  }
  
  PagoAbonoSaldo(requeste :any){ //Hace la consulta del Abono, Saldo Y MONTO
    return this.http.post<PagoAbonoSaldo>(`${this.url}/datos`, requeste)
  }

  descripcion(dato:any){//Es la descripción de los participantes, Como tal su nombre
    return this.http.post<any>(`${this.url}/descripcion`, dato)
  }

}
