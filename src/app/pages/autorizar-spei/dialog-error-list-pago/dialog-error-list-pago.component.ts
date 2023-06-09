import { Component, OnInit ,Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { InfoAutorizarSpei } from 'src/app/_model/InfoAutorizarSpei';

@Component({
  selector: 'app-dialog-error-list-pago',
  templateUrl: './dialog-error-list-pago.component.html',
  styleUrls: ['./dialog-error-list-pago.component.css']
})
export class DialogErrorListPagoComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DialogErrorListPagoComponent>,@Inject(MAT_DIALOG_DATA) private listaErrores: InfoAutorizarSpei[]) { }
  dataSource!: MatTableDataSource<InfoAutorizarSpei>;
  displayedColumns: string[] = ['dato1', 'dato2','dato3'];
  errores:InfoAutorizarSpei[]=[];
  ngOnInit(): void {
    this.errores =[]; 
    this.listaErrores.forEach(e=>{
      this.errores.push(e)
    })
    this.dataSource = new MatTableDataSource<InfoAutorizarSpei>(this.errores);
  }
  salir() {
    this.dialogRef.close();
    this.errores =[];
    this.listaErrores=[];
  }

}
