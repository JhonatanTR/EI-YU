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
import { NgxMaskModule } from 'ngx-mask';
import { IConfig } from 'ngx-mask';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = {};
import { DialogErrorListPagoComponent } from './pages/autorizar-spei/dialog-error-list-pago/dialog-error-list-pago.component'; // import NgxQRCodeModule


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
