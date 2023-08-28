import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { LocalStorageService } from '../_service/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SegundoPerfilResolverResolver implements Resolve<boolean> {
  constructor(private localStorageService: LocalStorageService) {}

  resolve(route: ActivatedRouteSnapshot): boolean {
    const segundoPerfil = this.localStorageService.getDat('segundoPerfil');
    return segundoPerfil;
  }
}
