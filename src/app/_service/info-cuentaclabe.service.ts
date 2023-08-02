import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HOST } from '../_shared/var.constant';
import { InfoCuentaClabe } from '../_model/InfoCuentaClabe';
import { Subject } from 'rxjs';
import { Param_Config_EiYu } from '../_model/Param_Config_EiYu';

@Injectable({
  providedIn: 'root'
})
export class InfoCuentaclabeService {
  listaCuentaNueva = new Subject<InfoCuentaClabe[]>();
  url: string = `${HOST}`
  constructor(private http: HttpClient) { }
   //Este servicio es exclusivo de la configuracion en cuenta
  guardarEnLatablaListarPagos(infoAutorizarSpei:InfoCuentaClabe){//Guarda en la tabla de cuentas
    return this.http.post<InfoCuentaClabe>(`${this.url}/api/cuenta`,infoAutorizarSpei);
  }
  listarPagosDeAutorizar(){//Listar en la tabla Cuentas
    return this.http.get<InfoCuentaClabe[]>(`${this.url}/api/listCuenta`);
  }
  listarPagosDeAutorizarPblu(dato:any){//Listar en la tabla Cuentas
    return this.http.post<InfoCuentaClabe[]>(`${this.url}/api/listPblu`,dato);
  }
  eliminar(infoCuentaClabe:InfoCuentaClabe){//Listar en la tabla Cuentas
    return this.http.post(`${this.url}/api/eliminar`,infoCuentaClabe);
  }
  modificar(infoCuentaClabe:InfoCuentaClabe){//Modifica la Cuentas clabe 
    return this.http.put<InfoCuentaClabe>(`${this.url}/api/modificar`,infoCuentaClabe);
  }
  buscarCuentaExiste(data:any){
    return this.http.post<any>(`${this.url}/validar/existeCuenta`,data);
  }
  buscarPbluConCuenta(data:any){
    return this.http.post<any>(`${this.url}/validar/existePblu`,data);
  }
  parametrosCuentaConcentradora(data:any){
    return this.http.post<Param_Config_EiYu>(`${this.url}/validar/param`,data)
  }

}
