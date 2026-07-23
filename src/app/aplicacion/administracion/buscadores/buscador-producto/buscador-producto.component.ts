import { Component, OnInit, signal, computed, inject, DestroyRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ProductoService } from '../../../servicios/producto.service';
import { AuthService } from '../../../servicios/auth.service';
import { ProductoBarraComponent } from '../../productos/producto-barra/producto-barra.component';
import { ProductoResumenComponent } from '../../productos/producto-resumen/producto-resumen.component';
import { ProductoFotosComponent } from '../../productos/producto-fotos/producto-fotos.component';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { CalculoService } from '../../../servicios/calculo.service';
import { ProductoImprimirComponent } from '../../productos/producto-imprimir/producto-imprimir.component';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-buscador-producto',
  templateUrl: './buscador-producto.component.html',
  styleUrl: './buscador-producto.component.scss',
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
    MatMenuModule,
    NgSelectModule
  ],
})
export class BuscadorProductoComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private cargando = inject(SpinnerService);
  private productoServicio = inject(ProductoService);
  private authServicio = inject(AuthService);
  private titleService = inject(Title);
  private calculoServicio = inject(CalculoService);
  private ingresoDetalleServicio = inject(IngresoDetalleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  buscadorFormGroup = this.fb.group({
    codigoBarra: [null as string | null],
  });

  productoFormGroup = this.fb.group({
    productoId: [null as string | null],
  });

  buscadorControl = false;
  productoControl = false;
  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];

  usuario = toSignal(this.authServicio.user$, { initialValue: null });
  listaCategorias: any;

  listaProductos = signal<any[]>([]);
  listaIngresos = signal<any[]>([]);

  private imagenesCargadas = new Map<string, boolean>();
  estadoCargaImagenes = new Map<string, boolean>();

  producto = signal<any>(null);

  totales = computed<any>(() => {
    const ingresos = this.listaIngresos();
    return this.calculoServicio.sumarPorColumnas(ingresos);
  });

  precioVenta = computed(() => {
    const ingresos = this.listaIngresos();
    if (!ingresos || ingresos.length === 0) {
      return 0;
    }
    const suma = ingresos.reduce((total: any, ingreso: any) => total + (ingreso.pv || 0), 0);
    const promedio = suma / ingresos.length;
    return parseFloat(promedio.toFixed(2));
  });

  @ViewChild('productoSelect', { static: false }) productoSelect!: NgSelectComponent;

  constructor() {
    const params = this.route.snapshot.queryParams;
    if (params['productoId']) {
      this.productoFormGroup.patchValue({ productoId: params['productoId'] }, { emitEvent: false });
    }
    if (params['codigoBarra']) {
      this.buscadorFormGroup.patchValue({ codigoBarra: params['codigoBarra'] }, { emitEvent: false });
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle('Buscar Producto');
    this.cargarProductos();

    this.productoFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        const idProducto = val.productoId;
        if (idProducto) {
          this.obtenerDatosProducto(idProducto);
        } else {
          this.producto.set(null);
          this.listaIngresos.set([]);
        }
        this.actualizarParametrosUrl();
      });
  }

  get b(): any { return this.buscadorFormGroup.controls; }
  get p(): any { return this.productoFormGroup.controls; }

  actualizarParametrosUrl(): void {
    const prodId = this.productoFormGroup.get('productoId')?.value;
    const barcode = this.buscadorFormGroup.get('codigoBarra')?.value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        productoId: prodId || null,
        codigoBarra: barcode || null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  cargarProductos(): void {
    try {
      const raw = localStorage.getItem('listaProductos');
      if (raw) {
        const lista = JSON.parse(raw);
        if (Array.isArray(lista)) {
          this.listaProductos.set(lista);
          this.tryFocusNgSelect();
          this.procesarUrlInicial();
          return;
        }
      }
    } catch (e) {
      console.warn('No se pudo leer listaProductos del localStorage:', e);
    }
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    console.log('CARGANDO PRODUCTOS DESDE SERVIDOR...');
    this.cargando.show('Cargando productos desde el Servidor...');
    this.productoServicio.obtenerConsulta({
      tipo: 'TODOS',
      activo: 'true',
      publicado: 'TODOS',
      categoria: 'TODOS',
      limite: 1000
    }).then((respuesta: any[]) => {
      const productoLista = (respuesta || [])
        .sort((a, b) => (a?.descripcion || '').localeCompare(b?.descripcion || ''))
        .map(producto => ({
          ...producto,
          dato: `${producto.codigo} - ${producto.descripcion}`
        }));

      this.listaProductos.set(productoLista);

      try {
        localStorage.setItem('listaProductos', JSON.stringify(productoLista));
      } catch (e) {
        console.warn('No se pudo guardar listaProductos en localStorage:', e);
      }

      this.tryFocusNgSelect();
      this.procesarUrlInicial();
      this.cargando.hide();
    }).catch(error => {
      console.error('Error al obtener productos:', error);
    });
  }

  private procesarUrlInicial() {
    const params = this.route.snapshot.queryParams;
    if (params['productoId']) {
      const idProducto = params['productoId'];
      this.productoFormGroup.patchValue({ productoId: idProducto }, { emitEvent: false });
      this.obtenerDatosProducto(idProducto);
    } else if (params['codigoBarra']) {
      this.buscadorFormGroup.patchValue({ codigoBarra: params['codigoBarra'] }, { emitEvent: false });
      this.buscarConCodigoDeBarra();
    }
  }

  obtenerDatosProducto(idProducto: any): void {
    const productoEncontrado = this.listaProductos().find((producto: any) => producto.id === idProducto);
    this.producto.set(productoEncontrado);
    console.log('PRODUCTO ENCONTRADO: ', productoEncontrado);
    if (productoEncontrado) {
      this.obtenerIngresos(idProducto);
    }
  }

  onSeleccionar(): void {}

  buscarConCodigoDeBarra(): void {
    if (this.b.codigoBarra.value) {
      const barraBuscar = this.b.codigoBarra.value;
      const productoEncontrado = this.listaProductos().find((producto: any) => producto.codigoBarra === barraBuscar);
      console.log('PRODUCTO BARRA: ', productoEncontrado);

      if (productoEncontrado) {
        this.producto.set(productoEncontrado);
        this.obtenerIngresos(productoEncontrado.id);

        this.productoFormGroup.patchValue({ productoId: productoEncontrado.id }, { emitEvent: false });
        this.actualizarParametrosUrl();

        this.b.codigoBarra.setValue('');
      } else {
        this.producto.set(null);
        this.listaIngresos.set([]);
        this.snackbar.open('NO SE ENCUENTRA', 'OK', { duration: 10000 });
        this.b.codigoBarra.setValue('');
        this.actualizarParametrosUrl();
      }
    }
  }

  obtenerIngresos(productoID: any): void {
    this.cargando.show();
    this.ingresoDetalleServicio.obtenerPorProductoParaVender(productoID).then((respuesta: any) => {
      console.log('INGRESOS DE PRODUCTOS: ', respuesta);
      this.listaIngresos.set(respuesta);
      this.cargando.hide();
    });
  }

  fotos(fila: any): void {
    const dialogRef = this.dialog.open(ProductoFotosComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: fila.id,
        objeto: fila
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {});
  }

  resumen(sucursal: any, fila: any): void {
    const dialogRef = this.dialog.open(ProductoResumenComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: fila.id,
        objeto: fila,
        sucursal: sucursal
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {});
  }

  barra(): void {
    const dialogRef = this.dialog.open(ProductoBarraComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: this.producto()?.id,
        objeto: this.producto()
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {});
  }

  imagenCargada(element: any): void {
    element.loading = false;
    if (element.id) {
      this.imagenesCargadas.set(element.id, true);
    }
  }

  imprimir(): void {
    const dialogRef = this.dialog.open(ProductoImprimirComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: this.producto()?.id,
        objeto: this.producto()
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {});
  }

  private tryFocusNgSelect(): void {
    setTimeout(() => {
      if (this.productoSelect) {
        this.productoSelect.focus();
      }
    }, 0);
  }
}
