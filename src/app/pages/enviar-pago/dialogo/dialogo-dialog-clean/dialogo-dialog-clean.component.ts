import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogoComponent } from '../dialogo.component';

@Component({
  selector: 'app-dialogo-dialog-clean',
  templateUrl: './dialogo-dialog-clean.component.html',
  styleUrls: ['./dialogo-dialog-clean.component.css']
})
export class DialogoDialogCleanComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoComponent>
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
