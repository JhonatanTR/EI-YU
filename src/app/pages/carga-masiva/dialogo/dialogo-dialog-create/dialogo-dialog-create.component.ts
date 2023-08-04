import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogoComponent } from '../dialogo.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-dialog-create',
  templateUrl: './dialogo-dialog-create.component.html',
  styleUrls: ['./dialogo-dialog-create.component.css']
})
export class DialogoDialogCreateComponent implements OnInit {

  montoTotal: number = 0;
  constructor(
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DialogoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: number
  ) { }

  ngOnInit(): void {
    this.montoTotal = this.data;
  }

  cancel(){
    this.dialogRef.close(false);
  }

  create(){
    this.dialogRef.close(true);
  }
}
