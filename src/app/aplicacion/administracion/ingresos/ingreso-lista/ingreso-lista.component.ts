import { Component, OnInit, signal, computed, inject, DestroyRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { IngresoFormComponent } from '../ingreso-form/ingreso-form.component';
import { IngresoService } from '../../../servicios/ingreso.service';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '../../../servicios/auth.service';
import { sucursales } from '../../../datos/sucursales';
import { IngresoTraspaso } from '../ingreso-traspaso/ingreso-traspaso';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-ingreso-lista',
  templateUrl: './ingreso-lista.component.html',
  styleUrls: ['./ingreso-lista.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    MatRadioModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatTooltip,
    MatMenuModule
  ],
})
export class IngresoListaComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private titleService = inject(Title);
  private cargando = inject(SpinnerService);
  private ingresoServicio = inject(IngresoService);
  private snackbar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private authServicio = inject(AuthService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  fechaHoy = new Date().toISOString().split('T')[0];
  hoy = new Date();
  primerDiaDelMes = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1);
  fechaInicial = this.primerDiaDelMes.toISOString().split('T')[0];

  buscadorFormGroup = this.fb.group({
    sucursal: ['TODOS'],
    fechaInicio: [this.fechaInicial],
    fechaFinal: [this.fechaHoy],
    finalizado: ['TODOS'],
  });

  buscadorControl = false;
  lista: any;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['codigo', 'sucursal', 'tipo', 'descripcion', 'total', 'opciones'];
  @ViewChild(MatSort) sort!: MatSort;

  usuario = toSignal(this.authServicio.user$, { initialValue: null });
  listaSucursales = sucursales;

  private profileSucursal: string | null = null;
  private ultimoFiltroConsulta: { sucursal: string, fechaInicio: string, fechaFinal: string, finalizado: string } | null = null;

  constructor() {
    const params = this.route.snapshot.queryParams;
    this.buscadorFormGroup.patchValue({
      sucursal: params['sucursal'] || 'TODOS',
      fechaInicio: params['fechaInicio'] || this.fechaInicial,
      fechaFinal: params['fechaFinal'] || this.fechaHoy,
      finalizado: params['finalizado'] || 'TODOS'
    }, { emitEvent: false });
  }

  ngOnInit() {
    this.titleService.setTitle('Ingresos de Productos');

    combineLatest([
      this.authServicio.perfil$,
      this.route.queryParams
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([perfil, params]) => {
        if (!perfil) return;

        if (perfil.sucursal && perfil.sucursal !== 'TODOS') {
          this.profileSucursal = perfil.sucursal;
          this.buscadorFormGroup.patchValue({ sucursal: perfil.sucursal }, { emitEvent: false });
          this.buscadorFormGroup.get('sucursal')?.disable();
        } else {
          this.profileSucursal = null;
          this.buscadorFormGroup.get('sucursal')?.enable();
        }

        const sucursalVal = this.profileSucursal || params['sucursal'] || 'TODOS';
        const fechaInicioVal = params['fechaInicio'] || this.fechaInicial;
        const fechaFinalVal = params['fechaFinal'] || this.fechaHoy;
        const finalizadoVal = params['finalizado'] || 'TODOS';

        this.buscadorFormGroup.patchValue({
          sucursal: sucursalVal,
          fechaInicio: fechaInicioVal,
          fechaFinal: fechaFinalVal,
          finalizado: finalizadoVal
        }, { emitEvent: false });

        const newFiltro = {
          sucursal: sucursalVal,
          fechaInicio: fechaInicioVal,
          fechaFinal: fechaFinalVal,
          finalizado: finalizadoVal
        };

        const hasChanged = !this.ultimoFiltroConsulta ||
          this.ultimoFiltroConsulta.sucursal !== newFiltro.sucursal ||
          this.ultimoFiltroConsulta.fechaInicio !== newFiltro.fechaInicio ||
          this.ultimoFiltroConsulta.fechaFinal !== newFiltro.fechaFinal ||
          this.ultimoFiltroConsulta.finalizado !== newFiltro.finalizado;

        if (hasChanged) {
          this.ultimoFiltroConsulta = newFiltro;
          this.obtenerConsulta();
        }
      });

    this.buscadorFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.actualizarParametrosUrl();
      });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  actualizarParametrosUrl(): void {
    const filtros = this.buscadorFormGroup.getRawValue();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sucursal: filtros.sucursal === 'TODOS' ? null : filtros.sucursal,
        fechaInicio: filtros.fechaInicio === this.fechaInicial ? null : filtros.fechaInicio,
        fechaFinal: filtros.fechaFinal === this.fechaHoy ? null : filtros.fechaFinal,
        finalizado: filtros.finalizado === 'TODOS' ? null : filtros.finalizado
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  obtenerConsulta() {
    this.cargando.show();
    this.ingresoServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then(res => {
      const resultadosOrdenados = res.sort((a: any, b: any) => b.codigo - a.codigo);
      this.dataSource.data = resultadosOrdenados;
      this.cargando.hide();
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(IngresoFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/administracion/ingresos/detalle/' + result.id]);
      }
    });
  }

  editar(fila: any): void {
    const dialogRef = this.dialog.open(IngresoFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        idUsuario: fila.usuarioId,
        id: fila.id,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerConsulta();
      }
    });
  }

  finalizar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'APROBAR INGRESO',
        mensaje: 'Esta seguro de realizar esta accion?',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.ingresoServicio.editar(fila.id, { aprobado: true }).then(resultado => {
          this.cargando.hide();
          this.snackbar.open('FINALIZADO', 'OK', {
            duration: 10000
          });
          this.obtenerConsulta();
        })
      }
    });
  }

  eliminar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Ingreso',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.ingresoServicio.editar(fila.id, { activo: false, usuarioElimina: this.usuario()?.email }).then(result => {
          this.cargando.hide();
          this.snackbar.open('Eliminado...', 'OK', { duration: 10000 });
          this.obtenerConsulta();
        })
      }
    });
  }

  nuevoTraspaso(): void {
    const dialogRef = this.dialog.open(IngresoTraspaso, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/administracion/ingresos/detalle/' + result.id]);
      }
    });
  }

  editarTraspaso(fila: any): void {
    const dialogRef = this.dialog.open(IngresoTraspaso, {
      width: '800px',
      data: {
        nuevo: false,
        idUsuario: fila.usuarioId,
        id: fila.id,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerConsulta();
      }
    });
  }
}
