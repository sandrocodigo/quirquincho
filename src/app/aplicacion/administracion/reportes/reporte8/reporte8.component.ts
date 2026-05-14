import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

// MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// COMPONENTES / SERVICIOS
import { NgSelectModule } from '@ng-select/ng-select';
import { KardexService } from '../../../servicios/karex.service';
import { ProductoService } from '../../../servicios/producto.service';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';
import { sucursales } from '../../../datos/sucursales';

@Component({
  selector: 'app-reporte8',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatDividerModule,
    MatTooltipModule,
    NgSelectModule
  ],
  templateUrl: './reporte8.component.html',
  styleUrl: './reporte8.component.scss'
})
export class Reporte8Component implements OnInit {
  private titleService = inject(Title);
  private kardexService = inject(KardexService);
  private productoService = inject(ProductoService);
  private ingresoDetalleService = inject(IngresoDetalleService);
  private egresoDetalleService = inject(EgresoDetalleService);
  private spinner = inject(SpinnerService);
  private fb = inject(FormBuilder);
  private snackbar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // signals
  listaIngresos = signal<any[]>([]);
  listaEgresos = signal<any[]>([]);
  listaKardex = signal<any[]>([]);
  listaProductos = signal<any[]>([]);
  listaSucursales = sucursales;

  // form group for filters
  buscadorFormGroup: FormGroup;

  // computed signals for totals
  totalIngresos = computed(() =>
    this.listaIngresos().reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0)
  );

  totalEgresos = computed(() =>
    this.listaEgresos().reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0)
  );

  totalKardexIngreso = computed(() =>
    this.listaKardex().reduce((acc, item) => item.tipo === 'INGRESO' ? acc + (Number(item.cantidad) || 0) : acc, 0)
  );

  totalKardexEgreso = computed(() =>
    this.listaKardex().reduce((acc, item) => item.tipo === 'EGRESO' ? acc + (Number(item.cantidad) || 0) : acc, 0)
  );

  constructor() {
    this.buscadorFormGroup = this.fb.group({
      sucursal: ['TODOS'],
      producto: [null]
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Reporte 8 - Conciliación 3 Columnas');
    this.cargarProductos().then(() => {
      this.cargarParametrosUrl();
    });
    
    this.buscadorFormGroup.valueChanges.subscribe((val) => {
      this.actualizarParametrosUrl(val);
      this.obtenerReporte();
    });
  }

  // Leer parámetros de la URL e inicializar el formulario
  private cargarParametrosUrl() {
    const params = this.route.snapshot.queryParams;
    if (params['sucursal'] || params['producto']) {
      this.buscadorFormGroup.patchValue({
        sucursal: params['sucursal'] || 'TODOS',
        producto: params['producto'] || null
      }, { emitEvent: true });
    }
  }

  // Actualizar la URL cuando cambian los filtros
  private actualizarParametrosUrl(filtros: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sucursal: filtros.sucursal === 'TODOS' ? null : filtros.sucursal,
        producto: filtros.producto || null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true // No crear nueva entrada en el historial por cada cambio de filtro
    });
  }

  async cargarProductos() {
    try {
      const cache = localStorage.getItem('listaProductos');
      if (cache) {
        const productos = JSON.parse(cache);
        this.listaProductos.set(productos);
      } else {
        const res = await this.productoService.obtenerConsulta({ activo: 'true', tipo: 'TODOS', publicado: 'TODOS' });
        const productos = res.map(p => ({ ...p, dato: `${p.codigo} - ${p.descripcion}` }));
        this.listaProductos.set(productos);
        localStorage.setItem('listaProductos', JSON.stringify(productos));
      }
    } catch (error) {
      console.error('Error al cargar productos', error);
    }
  }

  async obtenerReporte() {
    const filtros = this.buscadorFormGroup.getRawValue();
    
    if (!filtros.producto) {
      this.listaIngresos.set([]);
      this.listaEgresos.set([]);
      this.listaKardex.set([]);
      return;
    }

    const dataBusqueda = {
      ...filtros,
      fechaInicio: '2020-01-01',
      fechaFinal: new Date().toISOString().split('T')[0],
      tipo: 'TODOS',
      vehiculo: 'TODOS',
      empresa: 'TODOS',
      finalizado: 'true'
    };

    this.spinner.show('Conciliando movimientos...');
    try {
      const [ingresos, egresos, kardex] = await Promise.all([
        this.ingresoDetalleService.obtenerReporte(dataBusqueda),
        this.egresoDetalleService.obtenerReporte(dataBusqueda),
        this.kardexService.obtenerReporteKardex(filtros)
      ]);

      this.listaIngresos.set(ingresos || []);
      this.listaEgresos.set(egresos || []);
      this.listaKardex.set(kardex || []);
      
    } catch (error: any) {
      console.error('Error al obtener reporte:', error);
      this.snackbar.open('Error al obtener datos.', 'Cerrar', { duration: 3000 });
    } finally {
      this.spinner.hide();
    }
  }

  imprimir() {
    window.print();
  }
}
