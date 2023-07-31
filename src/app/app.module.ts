import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MaterialModule } from './material/material.module';
import { EnviarPagoComponent } from './pages/enviar-pago/enviar-pago.component';
import { DialogoComponent } from './pages/enviar-pago/dialogo/dialogo.component';
import { LocalStorageService } from './_service/local-storage.service'
import { BusquedaMovimientoComponent } from './pages/busqueda-movimiento/busqueda-movimiento.component';
import { BusquedaDialogComponent } from './pages/busqueda-movimiento/busqueda-dialog/busqueda-dialog.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TransferenciaComponent } from './pages/transferencia/transferencia.component';
import { AutorizarSpeiComponent } from './pages/autorizar-spei/autorizar-spei.component';
import { ConfiguracionesComponent } from './pages/configuraciones/configuraciones.component';
import { DialogoConfCuentaComponent } from './pages/configuraciones/dialogo-conf-cuenta/dialogo-conf-cuenta.component';
import { EnrolarTokenComponent } from './pages/enrolar-token/enrolar-token.component';
import { DialogErrorListPagoComponent } from './pages/autorizar-spei/dialog-error-list-pago/dialog-error-list-pago.component';
import { NgxMaskModule } from 'ngx-mask';
import { IConfig } from 'ngx-mask';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = {};
import { VerEstadoComponent } from './pages/busqueda-movimiento/ver-estado/ver-estado.component';
import { CargarCuentaComponent } from './pages/cargar-cuenta/cargar-cuenta/cargar-cuenta.component';
import { CargarCuentaRemoveDialogComponent } from './pages/cargar-cuenta/cargar-cuenta-remove-dialog/cargar-cuenta-remove-dialog.component';
import { CargarCuentaCreateDialogComponent } from './pages/cargar-cuenta/cargar-cuenta-create-dialog/cargar-cuenta-create-dialog.component';
import { DialogoDialogCleanComponent } from './pages/enviar-pago/dialogo/dialogo-dialog-clean/dialogo-dialog-clean.component';
import { DialogoDialogCreateComponent } from './pages/enviar-pago/dialogo/dialogo-dialog-create/dialogo-dialog-create.component'; // import NgxQRCodeModule


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    EnviarPagoComponent,
    DialogoComponent,
    BusquedaDialogComponent,
    BusquedaMovimientoComponent,
    TransferenciaComponent,
    AutorizarSpeiComponent,
    ConfiguracionesComponent,
    DialogoConfCuentaComponent,
    DialogoConfCuentaComponent,
    EnrolarTokenComponent,
    DialogErrorListPagoComponent,
    VerEstadoComponent,
    CargarCuentaComponent,
    CargarCuentaRemoveDialogComponent,
    CargarCuentaCreateDialogComponent,
    DialogoDialogCleanComponent,
    DialogoDialogCreateComponent,
    
  ],
  entryComponents: [DialogoComponent,BusquedaDialogComponent,DialogoConfCuentaComponent,EnrolarTokenComponent,DialogErrorListPagoComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    HttpClientModule,
      NgxMaskModule.forRoot(options),
    
    ],
  providers: [
    LocalStorageService,
    { provide: 'WINDOW', useFactory: () => window },
  
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
