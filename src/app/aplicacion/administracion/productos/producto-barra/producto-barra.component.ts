import { Component, ElementRef, ViewChild } from '@angular/core';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';
// import { NgxBarcode6Module } from 'ngx-barcode6';

import JsBarcode from 'jsbarcode';

import { Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


import { AuthService } from '../../../servicios/auth.service';
import { ProductoCategoriaService } from '../../../servicios/producto-categoria.service';
import { ProductoFabricanteService } from '../../../servicios/producto-fabricante.service';
import { ProductoService } from '../../../servicios/producto.service';
import { TituloService } from '../../../servicios/titulo.service';
import { ProveedorService } from '../../../servicios/proveedor.service';


@Component({
  selector: 'app-producto-barra',
    templateUrl: './producto-barra.component.html',
  styleUrl: './producto-barra.component.scss',
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
export class ProductoBarraComponent {

  @ViewChild('barcode', { static: false }) barcode!: ElementRef;

  producto: any;


  @ViewChild('tabla') tabla!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProductoBarraComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private auth: AuthService,
    private productoServicio: ProductoService,
    private pcServicio: ProductoCategoriaService,
    private pfServicio: ProductoFabricanteService,
    private proveedorServicio: ProveedorService,
    private tituloServicio: TituloService
  ) {
    this.producto = data.objeto;
  }

  ngAfterViewInit() {

    JsBarcode(this.barcode.nativeElement, this.producto.codigoBarra, {
      format: 'CODE128',
      lineColor: '#000',
      width: 2,
      height: 50,
      displayValue: true
    });
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
