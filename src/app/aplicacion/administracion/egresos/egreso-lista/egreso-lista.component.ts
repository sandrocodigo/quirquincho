import { Component, OnInit, signal, computed, inject, DestroyRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
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

import { EgresoFormComponent } from '../egreso-form/egreso-form.component';
import { EgresoService } from '../../../servicios/egreso.service';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';

import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../servicios/auth.service';
import { FacturaService } from '../../../servicios/factura.service';
import { sucursales } from '../../../datos/sucursales';
import { EgresoTraspasoComponent } from '../egreso-traspaso/egreso-traspaso.component';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-egreso-lista',
  templateUrl: './egreso-lista.component.html',
  styleUrls: ['./egreso-lista.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
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
export class EgresoListaComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  public router = inject(Router);
  private cargando = inject(SpinnerService);
  private egresoServicio = inject(EgresoService);
  private facturaServicio = inject(FacturaService);
  private snackbar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private titleService = inject(Title);
  private authServicio = inject(AuthService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  fechaHoy = new Date().toISOString().split('T')[0];
  hoy = new Date();
  primerDiaDelMes = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1);
  fechaInicial = this.primerDiaDelMes.toISOString().split('T')[0];

  buscadorFormGroup = this.fb.group({
    sucursal: ['TODOS'],
    fechaInicio: [this.fechaHoy],
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
      fechaInicio: params['fechaInicio'] || this.fechaHoy,
      fechaFinal: params['fechaFinal'] || this.fechaHoy,
      finalizado: params['finalizado'] || 'TODOS'
    }, { emitEvent: false });
  }

  ngOnInit() {
    this.titleService.setTitle('Egresos');

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
        const fechaInicioVal = params['fechaInicio'] || this.fechaHoy;
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
        fechaInicio: filtros.fechaInicio === this.fechaHoy ? null : filtros.fechaInicio,
        fechaFinal: filtros.fechaFinal === this.fechaHoy ? null : filtros.fechaFinal,
        finalizado: filtros.finalizado === 'TODOS' ? null : filtros.finalizado
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  obtenerConsulta() {
    this.cargando.show();
    this.egresoServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then(res => {
      console.log('LISTA DE EGRESOS', res);
      const resultadosOrdenados = res.sort((a: any, b: any) => b.codigo - a.codigo);
      this.dataSource.data = resultadosOrdenados;
      this.lista = res;
      this.cargando.hide();
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(EgresoFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/administracion/egresos/detalle/' + result.id]);
      }
    });
  }

  editar(fila: any): void {
    const dialogRef = this.dialog.open(EgresoFormComponent, {
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

  nuevoTraspaso(): void {
    const dialogRef = this.dialog.open(EgresoTraspasoComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/administracion/egresos/detalle/' + result.id]);
      }
    });
  }

  editarTraspaso(fila: any): void {
    const dialogRef = this.dialog.open(EgresoTraspasoComponent, {
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
        titulo: 'FINALIZAR EGRESO',
        mensaje: 'Esta seguro de realizar esta accion?',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.egresoServicio.editar(fila.id, { finalizado: true }).then(resultado => {
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
        titulo: 'Eliminar Egreso',
        mensaje: 'Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.egresoServicio.eliminar(fila.id).then(result => {
          this.cargando.hide();
          this.snackbar.open('Eliminado...', 'OK', {
            duration: 10000
          });
          this.obtenerConsulta();
        })
      }
    });
  }

  facturar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Desea Facturar?',
        mensaje: 'Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.facturaServicio.crearConId({ idEgreso: fila.id }).then(result => {
          this.cargando.hide();
          this.snackbar.open('Facturado...', 'OK', {
            duration: 10000
          });
        })
      }
    });
  }
}
