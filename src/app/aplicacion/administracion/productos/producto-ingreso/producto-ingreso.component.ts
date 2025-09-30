import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';


import { IngresoProductoIngresoComponent } from '../../ingresos/ingreso-producto-ingreso/ingreso-producto-ingreso.component';

import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { ProductoService } from '../../../servicios/producto.service';

@Component({
  selector: 'app-producto-ingreso',
  templateUrl: './producto-ingreso.component.html',
  styleUrls: ['./producto-ingreso.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,

  ],
})
export class ProductoIngresoComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;
  displayedColumns: string[] = ['descripcion', 'opciones'];
  dataSource: any;
  idIngreso: string;
  ingreso: any;
  lista: any;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private productoServicio: ProductoService,
    private ingresoDetalleServicio: IngresoDetalleService,
    public dialogRef: MatDialogRef<ProductoIngresoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idIngreso = data.idIngreso;
    this.ingreso = data.ingreso;
    this.buscadorFormGroup = this.fb.group({
      buscador: [''],
      idCategoria: [],
      idFabricante: [],
      idClasificacion: [],
      limite: [10],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.buscar();
    }, 0);
  }

  get b(): any { return this.buscadorFormGroup.controls; }

  buscar(): void {
    this.cargando.show();
    this.productoServicio.obtenerConsultaConSaldo(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {
      console.log('CONSULTA CON SALDO: ', respuesta);
      this.dataSource = new MatTableDataSource(respuesta);
      this.lista = respuesta;
      this.cargando.hide();
    });
  }

  crearConProducto(fila: any, cerrar: boolean): void {

    const fechaRegistro = new Date();
    this.cargando.show();
    this.ingresoDetalleServicio.crear({

      sucursal: this.ingreso.sucursal,
      ingreso: this.ingreso,
      ingresoId: this.idIngreso,
      ingresoCodigo: this.ingreso.codigo,
      ingresoDescripcion: this.ingreso.descripcion,

      producto: fila,
      productoId: fila.id,
      productoCodigo: fila.codigo,
      productoDescripcion: fila.descripcion,
      productoCodigoBarra: fila.codigoBarra,
      productoTipo: fila.tipo,
      productoFotosUrl: fila.fotosUrl ? fila.fotosUrl : '',

      cantidad: 1,
      cantidadSaldo: 0,
      pc: 0,
      pv: 0,
      subtotal: 0,

      fechaRegistro: fechaRegistro,

      finalizado: false,
    }).then(res => {
      console.log('RESPUESTA: ', res);
      this.snackbar.open('Adicionado! [+1] : ' + fila.descripcion, 'OK', { duration: 1000 });
      this.cargando.hide();
      if (cerrar) {
        this.dialogRef.close(res);
      }
    });
  }

  crearConIngreso(fila: any) {
    const fechaRegistro = new Date();
    const dialogRef = this.dialog.open(IngresoProductoIngresoComponent, {
      width: '600px',
      data: {
        nuevo: true,
        idIngreso: this.idIngreso,
        idProducto: fila.id,
        producto: fila,
        objeto: null
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('INGRESO SELECCIONADO: ', result.productoTipo);
        this.cargando.show();

        this.ingresoDetalleServicio.crear({

          sucursal: this.ingreso.sucursal,
          ingreso: this.ingreso,
          ingresoId: this.idIngreso,
          ingresoCodigo: this.ingreso.codigo,
          ingresoDescripcion: this.ingreso.descripcion,

          producto: result.producto,
          productoId: result.productoId,
          productoTipo: result.productoTipo,
          productoCodigo: result.productoCodigo,
          productoDescripcion: result.productoDescripcion,
          productoCodigoBarra: result.productoCodigoBarra,
          productoFotosUrl: result.productoFotosUrl ? result.productoFotosUrl : '',

          cantidad: 1,
          cantidadSaldo: 0,
          pc: result.pc,
          pv: result.pv,
          subtotal: result.pc,

          fechaRegistro: fechaRegistro,
          finalizado: false,
        }).then(res => {
          console.log('RESPUESTA: ', res);
          this.snackbar.open('Adicionado! [+1] : ' + result.productoDescripcion, 'OK', { duration: 1000 });
          this.cargando.hide();
          this.dialogRef.close(res);
        });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
