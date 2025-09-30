import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IngresoService } from '../../../servicios/ingreso.service';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';


@Component({
  selector: 'app-ingreso-imprimir',
  templateUrl: './ingreso-imprimir.component.html',
  styleUrl: './ingreso-imprimir.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,

  ],
})
export class IngresoImprimirComponent {
  fechaHoy = new Date();

  idIngreso: any;
  ingreso: any;

  detalle: any;
  total: any = 0;

  @ViewChild('tabla') tabla!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<IngresoImprimirComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private ingresoServicio: IngresoService,
    private ingresoDetalleServicio: IngresoDetalleService,
  ) {
    this.idIngreso = data.id;
  }

  // INICIAR
  ngOnInit() {
    this.obtenerIngreso();
  }

  // OBTENER USUARIO
  obtenerIngreso() {
    this.cargando.show();
    this.ingresoServicio.obtenerPorId(this.idIngreso).then(data => {
      this.ingreso = data;
      this.obtenerEgresoDetalle();
    })
  }

  obtenerEgresoDetalle(): void {
    this.ingresoDetalleServicio.obtenerPorIngreso(this.idIngreso).then(respuesta => {
      // console.log('DETALLE: ', respuesta);
      this.detalle = respuesta;
      this.total = this.calcularTotal();

      // this.imprimir();
      this.cargando.hide();
    });
  }

  calcularTotal() {
    let total = 0;
    this.detalle.forEach((item: any) => {
      total += item.subtotal;
    });
    return total.toFixed(2);
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
