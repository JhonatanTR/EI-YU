import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CargarCuentaComponent } from '../cargar-cuenta/cargar-cuenta.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cargar-cuenta-remove-dialog',
  templateUrl: './cargar-cuenta-remove-dialog.component.html',
  styleUrls: ['./cargar-cuenta-remove-dialog.component.css']
})
export class CargarCuentaRemoveDialogComponent implements OnInit {

  constructor(
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CargarCuentaComponent>,
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
