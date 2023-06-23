import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { login } from '../_model/InfoLogin';
import { requestOtp } from '../_modelRequest/requestOtp';

@Injectable({
  providedIn: 'root'
})
export class InfoLoginService {

  url: string = "http://localhost:8092";
  urlValidacionToken: string = "http://localhost:8090/encriptacion/token"
  urlPago: string = "http://20.88.171.49:9091/api/v1/saldo/eyu_saldo_dia_actual";
  constructor(private http: HttpClient) { }

  login(login: login) {//Realiza el login del sistema 
    return this.http.post<any>(`${this.url}/login`, login)
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
    return this.http.post(`${this.url}/tesseract/qrcode`, request, {
      responseType: 'blob' // El tipo de respuesta es "json"
    });
  }
  token(data: any) {//Genera el token dependiendo el Usuario Y contraseña
    return this.http.post<any>(this.urlValidacionToken, data);
  }
  saldo(TOKEN: any) {//para saber el saldo tienes que introducir el token antes devuelto 
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      })
    };
    return this.http.get<any>('http://20.88.171.49:9091/api/v1/saldo/eyu_saldo_dia_actual', httpOptions)
  }

  buscarNomUsuarioPorId(dato:any){
    return this.http.post<any>(`${this.url}/buscarIdUsuario`, dato)
  }


}

