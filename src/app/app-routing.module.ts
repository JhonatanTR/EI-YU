import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EnviarPagoComponent } from './pages/enviar-pago/enviar-pago.component';
import { BusquedaMovimientoComponent } from './pages/busqueda-movimiento/busqueda-movimiento.component';
import { TransferenciaComponent } from './pages/transferencia/transferencia.component';
import { AutorizarSpeiComponent } from './pages/autorizar-spei/autorizar-spei.component';
import { ConfiguracionesComponent } from './pages/configuraciones/configuraciones.component';
import { GuardServiceService } from './_service/guard-service.service';

const routes: Routes = [
  {path:"login",component:LoginComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path:"dashboard",component:DashboardComponent,canActivate:[GuardServiceService]},
  {path: "enviar_pago", component: EnviarPagoComponent,canActivate:[GuardServiceService]},
  {path: "busqueda_movimiento", component: BusquedaMovimientoComponent},
  {path: "trasferencia", component: TransferenciaComponent},
  {path: "autorizarspei", component: AutorizarSpeiComponent},
  {path: "configuracion", component: ConfiguracionesComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule  { }


