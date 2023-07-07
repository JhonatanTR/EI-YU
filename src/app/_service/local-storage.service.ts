import { Inject, Injectable } from '@angular/core';
import { Transacciones } from '../_model/transacciones';
import { InfoCapturaSPEI } from '../_model/InfoCapturaSPEI';
import { InfoSpei } from '../_model/InfoSpei';
import { InfoCapturaSPEIPago } from '../_model/InfoCapturaSPEIPago';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(@Inject('WINDOW') private window: Window) { }
  //lista De transacciones del excel mazivo
  setList(key: string, list: Transacciones[]): void {
    this.window.localStorage.setItem(key, JSON.stringify(list));
  }
  getList(key: string): any[] {
    let listString = this.window.localStorage.getItem(key);
    return listString ? JSON.parse(listString) : null;
  }
  removeExecel(): void {
    this.window.localStorage.removeItem("listExel");
  }
  clear(): void {
    this.window.localStorage.clear();
  }
  setExcelList(key: string, list: InfoCapturaSPEIPago[]): void {
    this.window.localStorage.setItem(key, JSON.stringify(list));
  }
  getExcelList(key: string): any[] {
    let listString = this.window.localStorage.getItem(key);
    return listString ? JSON.parse(listString) : null;
  }
  removeItem2Excel(): void {
    this.window.localStorage.removeItem("listarExel");
  }
  clearExecel(): void {
    this.window.localStorage.clear();
  }


  //codigo otp
  setDat(key: string, log: boolean): void {
    this.window.localStorage.setItem(key, JSON.stringify(log));
  }
  getDat(key: string) {
    let listString = this.window.localStorage.getItem(key);
    return listString ? JSON.parse(listString) : null;
  }
  removeItem(): void {
    this.window.localStorage.removeItem("log");
  }
  //Captura Spei
  setSpei(key: string, listEspei: InfoCapturaSPEI[]): void {
    this.window.localStorage.setItem(key, JSON.stringify(listEspei));
  }
  getSpei(key: string) {
    let listString = this.window.localStorage.getItem(key);
    return listString ? JSON.parse(listString) : [];
  }
  removeItemSpei(): void {
    this.window.localStorage.removeItem("listSpei");
  }
  //coonfiguracion de cuenta
  setCuentas(key: string, listEspei: string[]): void {
    this.window.localStorage.setItem(key, JSON.stringify(listEspei));
  }
  getCuentas(key: string) {
    let listString = this.window.localStorage.getItem(key);
    return listString ? JSON.parse(listString) : [];
  }
  removeItemCuentas(): void {
    this.window.localStorage.removeItem("cuentas");
  }
  //
  setIdPblu(key: string, id: number): void {
    this.window.localStorage.setItem(key, JSON.stringify(id));
  }
  getIdPblu(key: string) {
    let listString = this.window.localStorage.getItem(key);
    return listString ? JSON.parse(listString) : null;
  }
  removeItemPblu(): void {
    this.window.localStorage.removeItem("pblu");
  }

  setUsuario(key: string, infoSpei: InfoSpei): void {
    this.window.localStorage.setItem(key, JSON.stringify(infoSpei));
  }
  getUsuario(key: string) {
    let listString = this.window.localStorage.getItem(key);
    return listString ? JSON.parse(listString) : null;
  }
  removeItemUsuario(): void {
    this.window.localStorage.removeItem("userE");
  }
  setDesc(key: string, id: string): void {
    this.window.localStorage.setItem(key, JSON.stringify(id));
  }
  getDesc(key: string) {
    let listString = this.window.localStorage.getItem(key);
    return listString ? JSON.parse(listString) : null;
  }
}
