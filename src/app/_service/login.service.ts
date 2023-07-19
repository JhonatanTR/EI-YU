import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Cliente } from '../_model/cliente';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  cli = new Subject<Cliente>();
  rol = new Subject<boolean>();
  roln3=new Subject<boolean>();
  idPblu =new Subject<any>();
  descripcion=new Subject<string>();
  token=new Subject<string>();
  mensajeSubject = new Subject<string>();

  enviarMensaje(mensaje: string): void {
    this.mensajeSubject.next(mensaje);
  }
  mensaje$ = this.mensajeSubject.asObservable();
  constructor() { }
}
