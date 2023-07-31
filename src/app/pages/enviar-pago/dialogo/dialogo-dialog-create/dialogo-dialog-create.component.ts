import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogoComponent } from '../dialogo.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-dialog-create',
  templateUrl: './dialogo-dialog-create.component.html',
  styleUrls: ['./dialogo-dialog-create.component.css']
})
export class DialogoDialogCreateComponent implements OnInit {

  constructor(
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DialogoComponent>,
  ) { }

  ngOnInit(): void {
  }

  cancel(){
    this.dialogRef.close(false);
  }

  create(){
    this.dialogRef.close(true);
  }
}
