import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class GuardServiceService implements CanActivate {

  constructor(private router: Router, private localStorageService: LocalStorageService,private loginService: LoginService) { }
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      return true;
  }
}
