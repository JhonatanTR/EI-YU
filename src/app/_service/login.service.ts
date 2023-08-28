import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
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
  
  private segundoPerfilSubject = new BehaviorSubject<boolean>(false);
  segundoPerfil$ = this.segundoPerfilSubject.asObservable();

  setSegundoPerfil(value: boolean) {
    this.segundoPerfilSubject.next(value);
  }

  enviarMensaje(mensaje: string): void {
    this.mensajeSubject.next(mensaje);
  }
  mensaje$ = this.mensajeSubject.asObservable();
  constructor() { }
}
