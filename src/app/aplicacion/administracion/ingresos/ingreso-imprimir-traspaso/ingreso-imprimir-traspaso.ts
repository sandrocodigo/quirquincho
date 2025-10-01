import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-ingreso-imprimir-traspaso',
  templateUrl: './ingreso-imprimir-traspaso.html',
  styleUrl: './ingreso-imprimir-traspaso.css',
    standalone: true,
  imports: [
    CommonModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,

  ],
})
export class IngresoImprimirTraspaso {
fechaHoy = new Date();

  idIngreso: any;
  ingreso: any;

  detalle: any;
  total: any = 0;

  @ViewChild('tabla') tabla!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<IngresoImprimirTraspaso>,
  ) {
    this.idIngreso = data.id;
    this.ingreso = data.egreso;
    this.detalle = data.detalle;
    this.total = data.total;
  }

  // INICIAR
  ngOnInit() {

  }

  imprimir() {
    let printContents: any, popupWin: any;
    printContents = this.tabla.nativeElement.outerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

    setTimeout(() => {
      if (popupWin) {
        popupWin.document.open();
        popupWin.document.write(`
                <html>
                    <head>
                        <title>Egreso de productos</title>
                        <style>
                        .no-imprimir {
                          display: none;
                        }
                        table {
                          border-collapse: collapse;
                          width: 100%;
                      }
                      
                      th,
                      td {
                          border: 1px solid #808080; 
                          padding: 8px;
                          text-align: left;
                          font-size: 16px; 
                      }
                      
                      th {
                          background-color: #f2f2f2; 
                      }
                      
                      tr {
                          page-break-inside: avoid;
                      }
                      
                      thead {
                          display: table-header-group;
                      }
                        </style>
                    </head>
                    <body onload="window.print();window.close()">${printContents}</body>
                </html>`
        );
        popupWin.document.close();
      }
    }, 0);
  }
}
