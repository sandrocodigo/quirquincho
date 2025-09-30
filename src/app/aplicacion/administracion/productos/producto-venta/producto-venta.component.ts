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
import { IngresoProductoEgresoComponent } from '../../ingresos/ingreso-producto-egreso/ingreso-producto-egreso.component';


@Component({
  selector: 'app-producto-venta',
  templateUrl: './producto-venta.component.html',
  styleUrl: './producto-venta.component.scss',
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
export class ProductoVentaComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;
  displayedColumns: string[] = ['descripcion', 'pv', 'cantidadSaldo', 'opciones'];
  dataSource: any;
  idEgreso: string;
  egreso: any;
  lista: any;

  detalle: any;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private productoServicio: ProductoService,
    private ingresoDetalleServicio: IngresoDetalleService,
    private egresoDetalleServicio: EgresoDetalleService,
    public dialogRef: MatDialogRef<ProductoVentaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEgreso = data.idEgreso;
    this.egreso = data.egreso;
    this.detalle = data.detalle;
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

  seleccionar(producto: any) {
    this.dialogRef.close(producto);
  }


  crearConProducto(fila: any, cerrar: boolean) {
    const fechaRegistro = new Date();
    this.cargando.show();
    this.ingresoDetalleServicio.obtenerPorIdProducto(this.egreso.sucursal, fila.id).then(res => {
      console.log('DETALLE DE INGRESO: ', res);

      if (res.length > 0) {
        const ingresoDetalle = res[0];
        const detallePediente = this.buscarEnLaLista(this.detalle, "ingresoDetalleId", ingresoDetalle.id);

        if (detallePediente) {
          console.log('DETALLE PENDIENTE: ', detallePediente);
          this.sumar(detallePediente);
          this.dialogRef.close(res);
        } else {
          console.log('INGRESAR NUEVO DETALLE: ');
          this.egresoDetalleServicio.crear({

            egreso: this.egreso,
            egresoId: this.idEgreso,
            egresoCodigo: this.egreso.codigo,
            egresoDescripcion: this.egreso.descripcion,

            ingresoDetalleId: ingresoDetalle.id,
            ingresoCantidadSaldo: ingresoDetalle.cantidadSaldo,

            producto: ingresoDetalle.producto,
            productoId: ingresoDetalle.productoId,
            productoTipo: ingresoDetalle.productoTipo,
            productoCodigo: ingresoDetalle.productoCodigo,
            productoDescripcion: ingresoDetalle.productoDescripcion,
            productoCodigoBarra: ingresoDetalle.productoCodigoBarra,
            productoFotosUrl: ingresoDetalle.productoFotosUrl,

            cantidad: 1,
            pc: ingresoDetalle.pc,
            pv: ingresoDetalle.pv,
            subtotal: ingresoDetalle.pv,
            fechaRegistro: fechaRegistro,
            finalizado: false,
          }).then(res => {
            console.log('RESPUESTA: ', res);
            this.snackbar.open('Adicionado! [+1] : ' + ingresoDetalle.productoDescripcion, 'OK', { duration: 1000 });
            this.cargando.hide();
            if (cerrar) {
              this.dialogRef.close(res);
            }

          });
        }
      } else {
        this.snackbar.open('SIN SALDO', 'OK', { duration: 1000 });



        /*         const dialogRef = this.dialog.open(MensajeComponent, {
                  data: {
                    titulo: 'SALDO INSUFICIENTE',
                    mensaje: 'Se recomienda ingresar mas cantidades de ' + fila.descripcion + ' en Ingresos',
                  },
                });
        
                dialogRef.afterClosed().subscribe(async result => {
                  if (result) {
                  }
                }); */
      }

    });
  }

  crearConProductoServicio(fila: any): void {

    const fechaRegistro = new Date();
    console.log('PRODUCTO', fila);
    this.cargando.show();


    this.egresoDetalleServicio.crear({

      egresoId: this.idEgreso,
      egresoCodigo: this.egreso.codigo,
      egresoDescripcion: this.egreso.descripcion,
      egreso: this.egreso,

      productoId: fila.id,
      productoTipo: fila.tipo,
      productoCodigo: fila.codigo,
      productoDescripcion: fila.descripcion,
      productoCodigoBarra: fila.codigoBarra,
      productoFotosUrl: fila?.fotosUrl,
      producto: fila,

      cantidad: 1,
      pc: 0,
      pv: fila.precioServicio,
      subtotal: fila.precioServicio,
      detalle: '',
      fechaRegistro: fechaRegistro,
      finalizado: false,
    }).then(res => {
      console.log('RESPUESTA: ', res);
      this.snackbar.open('Adicionado! [+1] : ' + fila.descripcion, 'OK', { duration: 1000 });
      this.cargando.show();
      this.dialogRef.close(res);
    });

  }

  crearConIngreso(fila: any) {
    const fechaRegistro = new Date();
    const dialogRef = this.dialog.open(IngresoProductoEgresoComponent, {
      width: '600px',
      data: {
        nuevo: true,
        idEgreso: this.idEgreso,
        idProducto: fila.id,
        producto: fila,
        egreso: this.egreso,
        objeto: null
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('INGRESO SELECCIONADO: ', result);
        this.cargando.show();

        const ingresoDetalle = result;
        const detallePediente = this.buscarEnLaLista(this.detalle, "ingresoDetalleId", ingresoDetalle.id);

        this.egresoDetalleServicio.crear({

          egresoId: this.idEgreso,
          egresoCodigo: this.egreso.codigo,
          egresoDescripcion: this.egreso.descripcion,
          egreso: this.egreso,

          ingresoDetalleId: result.id,
          ingresoCantidadSaldo: result.cantidadSaldo,

          producto: result.producto,
          productoId: result.productoId,
          productoTipo: result.productoTipo,
          productoCodigo: result.productoCodigo,
          productoDescripcion: result.productoDescripcion,
          productoCodigoBarra: result.productoCodigoBarra,
          productoFotosUrl: result.productoFotosUrl,

          cantidad: 1,
          pc: result.pc,
          pv: result.pv,
          subtotal: result.pc,

          finalizado: false,
          fechaRegistro: fechaRegistro,
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

  sumar(fila: any) {
    const cantidadNuevo = +fila.cantidad + +1;
    const subtotal = cantidadNuevo * fila.pv;
    this.egresoDetalleServicio.editar(fila.id, {
      cantidad: cantidadNuevo,
      subtotal: subtotal,
    }).then(respuesta => {
      this.snackbar.open('Adicionado! [+1]', 'OK', { duration: 1000 });
    });
  }

  buscarEnLaLista<T>(list: T[], key: keyof T, value: any): T | undefined {
    return list.find(item => item[key] === value);
  }


}
