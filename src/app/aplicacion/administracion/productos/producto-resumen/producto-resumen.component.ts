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



import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { KardexService } from '../../../servicios/karex.service';


@Component({
  selector: 'app-producto-resumen',
  templateUrl: './producto-resumen.component.html',
  styleUrls: ['./producto-resumen.component.scss'],
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
export class ProductoResumenComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;
  displayedColumns: string[] = ['descripcion', 'opciones'];
  dataSource: any;

  idProducto: string;
  producto: any;

  listaKardex: any;

  listaIngresos: any;
  listaEgresos: any;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,

    private ingresoDetalleServicio: IngresoDetalleService,
    private egresoDetalleServicio: EgresoDetalleService,
    private kardexServicio: KardexService,
    public dialogRef: MatDialogRef<ProductoResumenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idProducto = data.id;
    this.producto = data.objeto;

    this.buscadorFormGroup = this.fb.group({
      buscador: [''],
      idProducto: [data.id],
      idAlmacen: [],
      limite: [10],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.buscar();
      this.buscarIngresos();
      this.buscarEgresos();
    }, 0);
  }

  get b(): any { return this.buscadorFormGroup.controls; }

  buscar(): void {
    this.cargando.show();
    this.kardexServicio.obtenerPorProducto(this.idProducto).then((respuesta: any) => {
      console.log('KARDEX DE PRODUCTOS: ', respuesta);
      // this.lista = respuesta;
      let suma = 0;
      this.listaKardex = respuesta.map((item: any) => {
        if (item.tipo == 'INGRESO') {
          suma += item.cantidad;
        } else {
          suma -= item.cantidad;
        }
        // suma += item.cantidad;
        return { ...item, cantidadAcumulada: suma };
      });
      this.cargando.hide();
    });
  }

  buscarIngresos(): void {
    this.cargando.show();
    this.ingresoDetalleServicio.obtenerPorProducto(this.idProducto).then((respuesta: any) => {
      console.log('INGRESOS DE PRODUCTOS: ', respuesta);
      this.listaIngresos = respuesta;
      this.cargando.hide();
    });
  }

  buscarEgresos(): void {
    this.cargando.show();
    this.egresoDetalleServicio.obtenerPorProducto(this.idProducto).then((respuesta: any) => {
      console.log('EGRESOS DE PRODUCTOS: ', respuesta);
      this.listaEgresos = respuesta;
      this.cargando.hide();
    });
  }

  asociar(fila: any) {
    this.dialogRef.close(fila);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
