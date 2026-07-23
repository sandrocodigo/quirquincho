import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSortModule } from '@angular/material/sort';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { AuthService } from '../../../servicios/auth.service';
import { sucursales } from '../../../datos/sucursales';

import { BreakpointObserver } from '@angular/cdk/layout';
import { ProgramacionService } from '../../../servicios/programacion.service';
import { VehiculoService } from '../../../servicios/vehiculo.service';
import { OrdenFormComponent } from '../orden-form/orden-form.component';
import { OrdenService } from '../../../servicios/orden.service';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-orden-lista',
  templateUrl: './orden-lista.component.html',
  styleUrl: './orden-lista.component.scss',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
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
    MatSortModule,
    MatMenuModule,
    NgSelectComponent
  ],
})
export class OrdenListaComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private cargando = inject(SpinnerService);
  private authServicio = inject(AuthService);
  private titleService = inject(Title);
  private vehiculoServicio = inject(VehiculoService);
  private breakpointObserver = inject(BreakpointObserver);
  private ordenServicio = inject(OrdenService);
  private pServicio = inject(ProgramacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  buscadorFormGroup = this.fb.group({
    sucursal: ['TODOS'],
    vehiculoId: ['TODOS'],
    activo: ['true'],
  });

  buscadorControl = false;
  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];
  filtro = signal<boolean>(false);

  usuario = toSignal(this.authServicio.user$, { initialValue: null });
  listaCategorias: any;

  listaOriginal = signal<any[]>([]);
  filtroBusqueda = signal<string>('');

  lista = computed(() => {
    const original = this.listaOriginal();
    const query = this.filtroBusqueda().trim().toLowerCase();
    if (!query) {
      return original;
    }
    return original.filter(item =>
      Object.values(item).some(value =>
        (value ?? '').toString().toLowerCase().includes(query)
      )
    );
  });

  listaVehiculos = signal<any[]>([]);
  listaSucursales = sucursales;
  listaActivos = [
    { id: 'TODOS', dato: 'TODOS' },
    { id: 'true', dato: 'ACTIVOS' },
    { id: 'false', dato: 'PASIVOS' }
  ];

  private profileSucursal: string | null = null;
  private ultimoFiltroConsulta: { sucursal: string, vehiculoId: string, activo: string } | null = null;

  constructor() {
    const params = this.route.snapshot.queryParams;
    this.buscadorFormGroup.patchValue({
      sucursal: params['sucursal'] || 'TODOS',
      vehiculoId: params['vehiculoId'] || 'TODOS',
      activo: params['activo'] || 'true'
    }, { emitEvent: false });
    this.filtroBusqueda.set(params['search'] || '');
  }

  ngOnInit(): void {
    this.titleService.setTitle('Ordenes');

    this.breakpointObserver.observe(['(max-width: 768px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.filtro.set(!result.matches);
      });

    this.obtenerVehiculos();

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
        const vehiculoVal = params['vehiculoId'] || 'TODOS';
        const activoVal = params['activo'] || 'true';
        const searchVal = params['search'] || '';

        this.buscadorFormGroup.patchValue({
          sucursal: sucursalVal,
          vehiculoId: vehiculoVal,
          activo: activoVal
        }, { emitEvent: false });

        this.filtroBusqueda.set(searchVal);

        const newFiltro = { sucursal: sucursalVal, vehiculoId: vehiculoVal, activo: activoVal };
        const hasChanged = !this.ultimoFiltroConsulta ||
          this.ultimoFiltroConsulta.sucursal !== newFiltro.sucursal ||
          this.ultimoFiltroConsulta.vehiculoId !== newFiltro.vehiculoId ||
          this.ultimoFiltroConsulta.activo !== newFiltro.activo;

        if (vehiculoVal !== 'TODOS') {
          if (hasChanged) {
            this.ultimoFiltroConsulta = newFiltro;
            this.obtenerConsulta();
          }
        } else {
          this.ultimoFiltroConsulta = null;
          this.listaOriginal.set([]);
        }
      });

    this.buscadorFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.actualizarParametrosUrl();
      });
  }

  actualizarParametrosUrl(): void {
    const filtros = this.buscadorFormGroup.getRawValue();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sucursal: filtros.sucursal === 'TODOS' ? null : filtros.sucursal,
        vehiculoId: filtros.vehiculoId === 'TODOS' ? null : filtros.vehiculoId,
        activo: filtros.activo === 'true' ? null : filtros.activo,
        search: this.filtroBusqueda() || null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  obtenerVehiculos(): Promise<void> {
    this.cargando.show();
    return this.vehiculoServicio.obtenerTodosActivos().then(res => {
      this.listaVehiculos.set([
        { id: 'TODOS', dato: 'TODOS' },
        ...res.map((res: any) => {
          res.dato = res.interno + ' - ' + res.placa;
          return res;
        })
      ]);
      console.log('VEHICULOS', res);
      this.cargando.hide();
    });
  }

  obtenerConsulta(): void {
    this.cargando.show();
    this.ordenServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {
      console.log('CONSULTA: ', respuesta);

      const hoy = new Date();

      const resultados = respuesta.map((item: any) => {
        const fechaProximo = new Date(item.fechaProximo);
        const diffTime = fechaProximo.setHours(0, 0, 0, 0) - hoy.setHours(0, 0, 0, 0);
        const diasFaltantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        item.faltaDias = diasFaltantes;
        return item;
      });

      const resultadosOrdenados = resultados.sort((a: any, b: any) => b.numero - a.numero);

      this.listaOriginal.set(resultadosOrdenados);
      this.cargando.hide();
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(OrdenFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
        objeto: null
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerConsulta();
      }
    });
  }

  editar(fila: any): void {
    const dialogRef = this.dialog.open(OrdenFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: fila.id,
        objeto: fila
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerConsulta();
      }
    });
  }

  eliminar(fila: any): void {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Orden',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.ordenServicio.editar(fila.id, { activo: false, usuarioElimina: this.usuario()?.email }).then(result => {
          this.pServicio.editar(fila.programacionId, { ordenId: null }).then(res => {
            this.cargando.hide();
            this.snackbar.open('Eliminado...', 'OK', { duration: 10000 });
            this.obtenerConsulta();
          });
        })
      }
    });
  }

  filtros(): void {
    this.filtro.update(val => !val);
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroBusqueda.set(filterValue);
    this.actualizarParametrosUrl();
  }
}
