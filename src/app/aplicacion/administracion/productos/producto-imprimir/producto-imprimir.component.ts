import { Component, ElementRef, ViewChild } from '@angular/core';
import { Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';


@Component({
  selector: 'app-producto-imprimir',
  templateUrl: './producto-imprimir.component.html',
  styleUrl: './producto-imprimir.component.scss',
  imports: [CommonModule,

    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class ProductoImprimirComponent {

  @ViewChild('barcode', { static: false }) barcode!: ElementRef;

  producto: any;
  @ViewChild('tabla') tabla!: ElementRef;

  listaIngresos: any = [];

  precioVenta = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProductoImprimirComponent>,
    private cargando: SpinnerService,
    private ingresoDetalleServicio: IngresoDetalleService,
  ) {
    this.producto = data.objeto;
    this.obtenerIngresos(this.producto.id);
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {

  }

  obtenerIngresos(productoID: any): void {
    this.cargando.show();
    this.ingresoDetalleServicio.obtenerPorProductoParaVender(productoID).then((respuesta: any) => {
      console.log('INGRESOS DE PRODUCTOS: ', respuesta);
      this.listaIngresos = respuesta;
      this.precioVenta = this.calcularPrecioPromedioPv();
      this.cargando.hide();
    });
  }

  calcularPrecioPromedioPv(): number {
    if (!this.listaIngresos || this.listaIngresos.length === 0) {
      return 0;
    }

    const suma = this.listaIngresos.reduce((total: any, ingreso: any) => total + (ingreso.pv || 0), 0);
    const promedio = suma / this.listaIngresos.length;
    return parseFloat(promedio.toFixed(2)); // redondea a 2 decimales
  }

  imprimir() {
    const printContents = this.tabla.nativeElement.outerHTML;
    const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

    if (!popupWin) return;

    popupWin.document.open();
    popupWin.document.write(`
        <html>
          <head>
            <title>Egreso de productos</title>
            <style>

            </style>
          </head>
          <body onload="window.print();window.close()">
            ${printContents}
          </body>
        </html>
      `);
    popupWin.document.close();

    // Verificamos si se cierra
    const interval = setInterval(() => {
      if (popupWin.closed) {
        clearInterval(interval); // Dejamos de verificar
        this.dialogRef.close(true); // Tu método a ejecutar
      }
    }, 500); // Verifica cada 0.5 segundos
  }

}
