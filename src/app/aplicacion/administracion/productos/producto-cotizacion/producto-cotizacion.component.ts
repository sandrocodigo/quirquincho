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



// import { IngresoProductoEgresoComponent } from '../../ingresos/ingreso-producto-egreso/ingreso-producto-egreso.component';
import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { ProductoService } from '../../../servicios/producto.service';
import { CotizacionDetalleService } from '../../../servicios/cotizacion-detalle.service';
import { IngresoProductoCotizacionComponent } from '../../ingresos/ingreso-producto-cotizacion/ingreso-producto-cotizacion.component';


@Component({
  selector: 'app-producto-cotizacion',
  templateUrl: './producto-cotizacion.component.html',
  styleUrl: './producto-cotizacion.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,

  ],
})
export class ProductoCotizacionComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;
  displayedColumns: string[] = ['descripcion', 'pv', 'cantidadSaldo', 'opciones'];
  dataSource: any;
  idCotizacion: string;
  cotizacion: any;
  lista: any;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private productoServicio: ProductoService,
    private cotizacionDetalleServicio: CotizacionDetalleService,

    public dialogRef: MatDialogRef<ProductoCotizacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idCotizacion = data.idCotizacion;
    this.cotizacion = data.cotizacion;
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

  crearConProducto(fila: any): void {

    console.log('PRODUCTO', fila);
    this.cargando.show();

    this.cotizacionDetalleServicio.crear({

      sucursal: this.cotizacion.sucursal,

      cotizacionId: this.idCotizacion,
      cotizacionCodigo: this.cotizacion.codigo,
      cotizacionDescripcion: this.cotizacion.descripcion,

      cotizacion: this.cotizacion,

      producto: fila,
      productoId: fila.id,
      productoTipo: fila.tipo,
      productoCodigo: fila.codigo,
      productoDescripcion: fila.descripcion,
      productoFotosUrl: fila?.fotosUrl ? fila?.fotosUrl : fila.imagenUrl,

      ingresoDetalleCantidadSaldo: 0,

      cantidad: 1,
      pc: 0,
      pv: 0,
      subtotal: 0,
      detalle: '',

      finalizado: false,
      fechaRegistro: new Date(),
    }).then(res => {
      // console.log('RESPUESTA: ', res);
      this.snackbar.open('Adicionado! [+1] : ' + fila.descripcion, 'OK', { duration: 1000 });
      this.cargando.show();
      this.dialogRef.close(res);
    });

  }

  crearConIngreso(fila: any) {
    const dialogRef = this.dialog.open(IngresoProductoCotizacionComponent, {
      width: '600px',
      data: {
        nuevo: true,
        idProducto: fila.id,
        producto: fila,
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('INGRESO SELECCIONADO: ', result);
        this.cargando.show();

        this.cotizacionDetalleServicio.crear({

          sucursal: this.cotizacion.sucursal,
          cotizacionId: this.idCotizacion,
          cotizacionCodigo: this.cotizacion.codigo,
          cotizacionDescripcion: this.cotizacion.descripcion,
          cotizacion: this.cotizacion,

          ingreso: result.ingreso,
          ingresoId: result.ingresoId,
          ingresoCodigo: result.ingresoCodigo,
          ingresoDescripcion: result.ingresoDescripcion,

          ingresoDetalle: result,
          ingresoDetalleId: result.id,
          ingresoDetalleCantidadSaldo: result.cantidadSaldo,

          producto: result.producto,
          productoId: result.productoId,
          productoCodigo: result.productoCodigo,
          productoDescripcion: result.productoDescripcion,
          productoCodigoBarra: result.productoCodigoBarra,
          productoTipo: result.productoTipo,
          productoFotosUrl: result.productoFotosUrl ? result.productoFotosUrl : '',
          ingresoCantidadSaldo: fila.cantidadSaldoTotal,

          cantidad: 1,
          pc: result.pc || 0,
          pv: result.pv || 0,
          subtotal: result.pv || 0,

          detalle: '',

          finalizado: false,
          fechaRegistro: new Date(),
        }).then(res => {
          console.log('RESPUESTA: ', res);
          this.snackbar.open('Adicionado! [+1] : ' + result.productoDescripcion, 'OK', { duration: 1000 });
          this.cargando.show();
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
