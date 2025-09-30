import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';

@Component({
  selector: 'app-ingreso-producto-cotizacion',
  templateUrl: './ingreso-producto-cotizacion.component.html',
  styleUrl: './ingreso-producto-cotizacion.component.scss',
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
export class IngresoProductoCotizacionComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;
  
  displayedColumns: string[] = ['fecha',  'pv', 'cantidad', 'cantidadSaldo', 'opciones'];
  dataSource: any;

  idProducto: any;
  producto: any;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private cargando: SpinnerService,
    private idServicio: IngresoDetalleService,
    public dialogRef: MatDialogRef<IngresoProductoCotizacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idProducto = data.idProducto;
    this.producto = data.producto;

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
    this.idServicio.obtenerPorProducto(this.idProducto).then((respuesta: any) => {
      console.log('INGRESO DETALLES: ', respuesta);
      this.dataSource = new MatTableDataSource(respuesta);
      this.cargando.hide();
    });
  }

  seleccionarIngreso(fila: any): void {
    this.dialogRef.close(fila);
  }
}
