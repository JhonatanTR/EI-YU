import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-limpiar',
  templateUrl: './dialogo-limpiar.component.html',
  styleUrls: ['./dialogo-limpiar.component.css']
})
export class DialogoLimpiarComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoLimpiarComponent>
  ) { }

  ngOnInit(): void {
  }

  cancel(){
    this.dialogRef.close(false);
  }

  remove(){
    this.dialogRef.close(true);
  }

}
