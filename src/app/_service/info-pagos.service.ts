import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InfoCapturaSPEIPago } from '../_model/InfoCapturaSPEIPago';
import { InfoAutorizarSpei } from '../_model/InfoAutorizarSpei';
import { HOST, HOSTPAGO } from '../_shared/var.constant';

@Injectable({
  providedIn: 'root'
})
export class InfoPagosService {

  urlPago: string = `${HOSTPAGO}/encriptacion/pago` //Esta url Hace el envio del pago apuntando al micro
  urlEnlistar: string = `${HOST}/spei`;//Esta url Hace el listado de Autorizar Spei
  constructor(private http: HttpClient) { }

  realizarPago(infoCapturaSPEIPago: InfoCapturaSPEIPago) {//DA DE ALTA UN PAGO
    return this.http.post<any>(this.urlPago, infoCapturaSPEIPago);
  }
  
  realizarPagoMazivo(infoCapturaSPEIPago: InfoCapturaSPEIPago[]) {//DA DE ALTA UN PAGO
    return this.http.post<any>(`${this.urlPago}/masivo`, infoCapturaSPEIPago);
  }

  guardarEnLatablaListarPagos(infoAutorizarSpei: InfoAutorizarSpei) {//Guarda en la tabla listarSpei
    return this.http.post<InfoAutorizarSpei>(`${this.urlEnlistar}/speiOut`, infoAutorizarSpei);
  }
  listarPagosDeAutorizar() {//Guarda en la tabla listarSpei
    return this.http.get<InfoAutorizarSpei[]>(`${this.urlEnlistar}/speiOutList`);
  }
  listarPagoSoloTrue(dato: any) {//Listar solo true
    return this.http.post<InfoAutorizarSpei[]>(`${this.urlEnlistar}/listNoPagado`, dato);
  }
  listarPagoSoloTrueRol(dato: any) {//Listar solo true
    return this.http.post<InfoAutorizarSpei[]>(`${this.urlEnlistar}/listNoPagadoRol`, dato);
  }
  listarPagoSoloTrueRolIntermedio(dato: any) {//Listar solo true
    return this.http.post<InfoAutorizarSpei[]>(`${this.urlEnlistar}/listNoPagadoRolIntermedio`, dato);
  }
  actualizarPagados(infoAutorizarSpei: InfoAutorizarSpei) {//actualizar a true  si han sido pagados
    return this.http.put<InfoAutorizarSpei>(`${this.urlEnlistar}/actualizar`, infoAutorizarSpei);
  }
  buscarLlaveUsuario(dato: any) {//Listar solo true
    return this.http.post<any>(`${this.urlEnlistar}/consultaId`, dato);
  }


}
