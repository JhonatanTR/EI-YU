import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { MatTableDataSource } from '@angular/material/table';

export interface PDFData {
  Movimiento: string;
  DescripcionComercio: string;
  Fecha: string;
  Retiros: string;
  Depositos: string;
}

@Component({
  selector: 'app-generador-pdf',
  templateUrl: './generador-pdf.component.html',
  styleUrls: ['./generador-pdf.component.css']
})
export class GeneradorPdfComponent implements OnInit {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  displayedColumns: string[] = ['Movimiento', 'Descripcion Comercio', 'Fecha', 'Retiros', 'Depositos'];
  dataSource!: MatTableDataSource<PDFData>;
  data = [
    {
      Movimiento: 'Retiro',
      DescripcionComercio: 'Descripcion Comercio 1',
      Fecha: 'Fecha 1',
      Retiros: 'Retiros 1',
      Depositos: 'Depositos 1',
    },
    {
      Movimiento: 'Deposito',
      DescripcionComercio: 'Descripcion Comercio 2',
      Fecha: 'Fecha 2',
      Retiros: 'Retiros 2',
      Depositos: 'Depositos 2',
    },
    {
      Movimiento: 'Retiro',
      DescripcionComercio: 'Descripcion Comercio 3',
      Fecha: 'Fecha 3',
      Retiros: 'Retiros 3',
      Depositos: 'Depositos 3',
    },
  ];

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.data);
  }

  generatePDF() {
    const content = this.pdfContent.nativeElement;
    const pdfOptions = {
      background: 'white',
      scale: 3,
      scrollX: 0,
      scrollY: 0,
    };

    html2canvas(content, pdfOptions).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ejemplo.pdf');
    });
  }

}
