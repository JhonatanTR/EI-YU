import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EnviarPagoComponent } from './pages/enviar-pago/enviar-pago.component';
import { BusquedaMovimientoComponent } from './pages/busqueda-movimiento/busqueda-movimiento.component';
import { TransferenciaComponent } from './pages/transferencia/transferencia.component';
import { AutorizarSpeiComponent } from './pages/autorizar-spei/autorizar-spei.component';
import { ConfiguracionesComponent } from './pages/configuraciones/configuraciones.component';
import { GuardServiceService } from './_service/guard-service.service';
import { CargarCuentaComponent } from './pages/cargar-cuenta/cargar-cuenta/cargar-cuenta.component';
import { CargaMasivaComponent } from './pages/carga-masiva/carga-masiva.component';
import { LoginComponent } from './login/login.component';
import { GeneradorPdfComponent } from './pages/pdf-generator/generador-pdf/generador-pdf.component';
import { AjustesComponent } from './pages/ajustes/ajustes.component';
import { CambiarPasswordComponent } from './pages/ajustes/cambiar-password/cambiar-password.component';

const routes: Routes = [
  {path:"login",component:LoginComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path:"dashboard",component:DashboardComponent,canActivate:[GuardServiceService]},
  {path: "enviar-pago", component: EnviarPagoComponent,canActivate:[GuardServiceService]},
  {path: "busqueda-movimiento", component: BusquedaMovimientoComponent, canActivate:[GuardServiceService]},
  {path: "trasferencia", component: TransferenciaComponent, canActivate:[GuardServiceService]},
  {path: "autorizarspei", component: AutorizarSpeiComponent, canActivate:[GuardServiceService]},
  {path: "configuracion", component: ConfiguracionesComponent, canActivate:[GuardServiceService]},
  {path: "cargar-cuenta", component: CargarCuentaComponent, canActivate:[GuardServiceService]},
  {path: "carga-masiva-pagos", component: CargaMasivaComponent, canActivate:[GuardServiceService]},
  {path: "generar-pdf", component: GeneradorPdfComponent, canActivate:[GuardServiceService]},
  {path: "ajustes", component: AjustesComponent, canActivate:[GuardServiceService]},
  {path: "change-password", component: CambiarPasswordComponent, canActivate:[GuardServiceService]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule  { }


