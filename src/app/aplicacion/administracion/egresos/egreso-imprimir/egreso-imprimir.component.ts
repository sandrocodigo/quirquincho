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
import { EgresoService } from '../../../servicios/egreso.service';
import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';


@Component({
  selector: 'app-egreso-imprimir',
  templateUrl: './egreso-imprimir.component.html',
  styleUrl: './egreso-imprimir.component.scss',
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
export class EgresoImprimirComponent {

  fechaHoy = new Date();

  idEgreso: any;
  egreso: any;

  detalle: any;
  total: any = 0;

  @ViewChild('tabla') tabla!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EgresoImprimirComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private egresoServicio: EgresoService,
    private egresoDetalleServicio: EgresoDetalleService,
  ) {
    this.idEgreso = data.id;
  }

  // INICIAR
  ngOnInit() {
    this.obtenerIngreso();
  }

  // OBTENER USUARIO
  obtenerIngreso() {
    this.cargando.show();
    this.egresoServicio.obtenerPorId(this.idEgreso).then(data => {
      this.egreso = data;
      this.obtenerEgresoDetalle();
    })
  }

  obtenerEgresoDetalle(): void {
    this.egresoDetalleServicio.obtenerPorEgreso(this.idEgreso).then(respuesta => {
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

  imprimirTicket() {
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
                  body {
                    font-family: 'Courier New', Courier, monospace;
                    width: 75mm; /* Ajusta según el ancho de tu impresora */
                    margin: 0;
                    padding: 0;
                    font-size: 12px;
                  }
                  .ticket-header {
                    text-align: center;
                    font-size: 14px;
                    font-weight: bold;
                    border-bottom: 1px dashed black;
                    margin-bottom: 5px;
                    padding-bottom: 5px;
                  }
                  .ticket-body table {
                    width: 100%;
                    border-collapse: collapse;
                  }
                  .ticket-body th,
                  .ticket-body td {
                    text-align: left;
                    padding: 2px 5px;
                    font-size: 10px;
                  }
                  .ticket-body th {
                    text-align: left;
                    font-weight: bold;
                  }
                  .ticket-footer {
                    margin-top: 10px;
                    text-align: right;
                    border-top: 1px dashed black;
                    padding-top: 5px;
                  }
                </style>
              </head>
              <body onload="window.print();window.close()">
                ${printContents}
              </body>
            </html>`
        );
        popupWin.document.close();
      }
    }, 0);
  }



}
