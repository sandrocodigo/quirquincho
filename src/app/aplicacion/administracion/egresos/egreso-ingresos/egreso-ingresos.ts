import { Component, Inject, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

// SERVICES & MODELS
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { IngresoDetalle } from '../../../modelos/ingreso-detalle';

@Component({
  selector: 'app-egreso-ingresos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './egreso-ingresos.html',
  styleUrl: './egreso-ingresos.scss'
})
export class EgresoIngresos implements OnInit {
  // Services
  private readonly cargando = inject(SpinnerService);
  private readonly ingresoDetalleServicio = inject(IngresoDetalleService);
  private readonly snackbar = inject(MatSnackBar);
  public readonly dialogRef = inject(MatDialogRef<EgresoIngresos>);

  // Signals
  readonly productInfo = signal<{
    sucursal: string,
    id: string,
    codigo: string,
    descripcion: string
  }>({
    sucursal: '',
    id: '',
    codigo: '',
    descripcion: ''
  });

  readonly ingresos = signal<any[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Computed
  readonly totalStock = computed(() =>
    this.ingresos().reduce((acc, curr) => acc + (curr.cantidadSaldo || 0), 0)
  );

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    if (data) {
      this.productInfo.set({
        sucursal: data.sucursal || '',
        id: data.productoId || '',
        codigo: data.productoCodigo || 'S/C',
        descripcion: data.productoDescripcion || 'Sin descripción'
      });
    }
  }

  ngOnInit(): void {
    this.listarIngresos();
  }

  async listarIngresos() {
    const sucursal = this.productInfo().sucursal;
    const id = this.productInfo().id;
    if (!id) return;

    this.isLoading.set(true);
    this.cargando.show('Buscando ingresos disponibles...');

    try {
      // Usamos obtenerPorProductoParaVender para mostrar solo los que tienen saldo
      const data = await this.ingresoDetalleServicio.obtenerPorIdProducto(sucursal, id);
      this.ingresos.set(data);
    } catch (error) {
      console.error('Error listing incomes:', error);
      this.snackbar.open('Error al obtener los ingresos del producto', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
      this.cargando.hide();
    }
  }

  seleccionar(item: any) {
    this.dialogRef.close(item);
  }

  cerrar() {
    this.dialogRef.close();
  }
}
