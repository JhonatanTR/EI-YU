import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { login } from '../_model/InfoLogin';
import { requestOtp } from '../_modelRequest/requestOtp';
import { HOST, HOSTLOGIN, HOSTPAGO } from '../_shared/var.constant';

@Injectable({
  providedIn: 'root'
})
export class InfoLoginService {

  url: string = `${HOSTLOGIN}`;
  urlValidacionToken: string = `${HOSTPAGO}/encriptacion/token`
  urlSaldo:string=`${HOST}`
  constructor(private http: HttpClient) { }

  
  login(login: login) {//Realiza el login del sistema 

    // Configurar los encabezados CORS
   
    return this.http.post<any>(`${this.url}/iniciar/login`, login)
  }
  optenerIdTokenEnrParticipante(data: any) {//Realiza el login del sistema 
    return this.http.post<any>(`${this.url}/enroladors`, data)
  }
  actualizarUsuario(data: any) {//actualiza El cliente Usuario
    return this.http.put<any>(`${this.url}/actualizar`, data)
  }
  verificarOtp(rtOtp: requestOtp) {//Verifica si el codigo OTP es correcto
    return this.http.post<any>(`${this.url}/otp/validar`, rtOtp);
  }
  generadorQr(request: any) {//Genera el codigo QR Para realizar el enrolamiento
    return this.http.post(`${this.url}/iniciar/tesseract/qrcode`, request, {
      responseType: 'blob' // El tipo de respuesta es "json"
    });
  }
  token(data: any) {//Genera el token dependiendo el Usuario Y contraseña
    return this.http.post<any>(this.urlValidacionToken, data);
  }
  saldo(dato: any) {//para saber el saldo tienes que introducir el token antes devuelto 
    return this.http.post<any>(`${this.urlSaldo}/api/saldo`,dato)
  }
  saldoACTUAL(data:any) {//para saber el saldo tienes que introducir el token antes devuelto 
    return this.http.post<any>(`${this.urlSaldo}/api/saldoActual`,data)
  }

  buscarNomUsuarioPorId(dato: any) {
    return this.http.post<any>(`${this.url}/buscarIdUsuario`, dato)
  }


}

