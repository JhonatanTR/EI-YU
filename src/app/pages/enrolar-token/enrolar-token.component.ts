import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InfoLoginService } from 'src/app/_service/info-login.service';

import { DomSanitizer } from '@angular/platform-browser';
import { catchError, finalize, of } from 'rxjs';
@Component({
  selector: 'app-enrolar-token',
  templateUrl: './enrolar-token.component.html',
  styleUrls: ['./enrolar-token.component.css']
})
export class EnrolarTokenComponent implements OnInit {
  mostrarSpinner = false; // Variable que indica si se debe mostrar el spinner de carga
mostrarQR = false; // Variable que indica si se debe mostrar el código QR
textBtn: string = "CREAR"; // Variable para almacenar el texto del botón, con valor inicial "CREAR"
textHead: string = "Crear mi token"; // Variable para almacenar el texto del encabezado, con valor inicial "Crear mi token"
btnD = false; // Variable que indica si el botón está deshabilitado
constructor(private sanitization: DomSanitizer, private dialogRef: MatDialogRef<EnrolarTokenComponent>, private loginSer: InfoLoginService, @Inject(MAT_DIALOG_DATA) private datoRecibido: number) { }
enrolarAlusuario = { "idUsuario": this.datoRecibido }; // Objeto para almacenar el ID de usuario a enrolar
ngOnInit(): void {

}
enrolar() {
  this.mostrarSpinner = true; // Mostrar el spinner de carga
  this.btnD = true; // Deshabilitar el botón
  this.crearCodigoqr(); // Llamar a la función para crear el código QR

}
imagenData: any;
crearCodigoqr() {
  this.textBtn = "Token Creado"; // Cambiar el texto del botón a "Token Creado"
  this.mostrarQR = false; // Ocultar el código QR
  this.loginSer.generadorQr(this.enrolarAlusuario)  .pipe(
    finalize(() => {
      this.mostrarSpinner = false; // Ocultar el spinner de carga
      this.mostrarQR = true; // Mostrar el código QR   // Código a ejecutar al finalizar
    })
  ).pipe(
    catchError((error) => {
     
      return of(null);
    })).subscribe(data => {
    this.convertir(data); // Llamar a la función para convertir los datos en formato de imagen
  });
}
convertir(data: any) {
  let reader = new FileReader();
  reader.readAsDataURL(data);
  reader.onloadend = () => {
    let x = reader.result;
    this.setear(x); // Llamar a la función para establecer la imagen convertida
  };
}
setear(x: any) {
  this.imagenData = this.sanitization.bypassSecurityTrustResourceUrl(x); // Establecer la imagen convertida
}

salir() {
  this.dialogRef.close(); // Cerrar el diálogo
}




}
