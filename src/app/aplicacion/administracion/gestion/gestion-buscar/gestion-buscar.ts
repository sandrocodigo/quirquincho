import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';


import { ProductoService } from '../../../servicios/producto.service';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../servicios/auth.service';

import { ProductoBarraComponent } from '../../productos/producto-barra/producto-barra.component';
import { ProductoResumenComponent } from '../../productos/producto-resumen/producto-resumen.component';
import { ProductoFotosComponent } from '../../productos/producto-fotos/producto-fotos.component';
import { ProductoFormComponent } from '../../productos/producto-form/producto-form.component';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { CalculoService } from '../../../servicios/calculo.service';
import { ProductoImprimirComponent } from '../../productos/producto-imprimir/producto-imprimir.component';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';


@Component({
  selector: 'app-gestion-buscar',
  templateUrl: './gestion-buscar.html',
  styleUrl: './gestion-buscar.css',
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
export class GestionBuscar {

  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  productoFormGroup: FormGroup;
  productoControl = false;

  usuario: any | null = null;


  listaProductos: any = [];
  listaIngresos: any = [];

  private imagenesCargadas = new Map<string, boolean>();
  estadoCargaImagenes = new Map<string, boolean>();

  producto: any;

  totales: any;

  precioVenta = 0;

  @ViewChild('productoSelect', { static: false }) productoSelect!: NgSelectComponent;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private productoServicio: ProductoService,
    private authServicio: AuthService,
    private titleService: Title,
    private calculoServicio: CalculoService,
    private ingresoDetalleServicio: IngresoDetalleService,

  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }
    });

    this.buscadorFormGroup = this.fb.group({
      codigoBarra: [null],
    });

    this.productoFormGroup = this.fb.group({
      productoId: [null],
    });

    //this.establecerSuscripcionForm
    this.establecerSuscripcionProducto();

  }

  ngOnInit(): void {
    this.titleService.setTitle('Buscar Producto');
    this.cargarProductos();
  }

  get b(): any { return this.buscadorFormGroup.controls; }
  get p(): any { return this.productoFormGroup.controls; }

  establecerSuscripcionProducto() {
    this.p.productoId.valueChanges.subscribe((val: any) => {
      if (this.p.productoId.value) {
        const idProducto = this.p.productoId.value;
        this.obtenerDatosProducto(idProducto);
      }
    });
  }

  cargarProductos() {
    try {
      const raw = localStorage.getItem('listaProductosTodos');
      if (raw) {
        const lista = JSON.parse(raw);
        if (Array.isArray(lista)) {
          this.listaProductos = lista;
          this.tryFocusNgSelect();
          return; // listo: cargado desde cache
        }
      }
    } catch (e) {
      console.warn('No se pudo leer listaProductos del localStorage:', e);
    }
    // si no hay cache válido, traer del servidor
    this.obtenerProductos();
  }

  obtenerProductos() {
    console.log('CARGANDO PRODUCTOS DESDE SERVIDOR...');
    this.cargando.show('Cargando productos desde el Servidor...');
    this.productoServicio.obtenerConsulta({
      tipo: 'TODOS',
      activo: 'TODOS',
      publicado: 'TODOS',
      categoria: 'TODOS',
      limite: 1000
    }).then((respuesta: any[]) => {

      const productoLista = (respuesta || [])
        .sort((a, b) => (a?.descripcion || '').localeCompare(b?.descripcion || ''))
        .map(producto => ({
          ...producto,
          dato: `${producto.codigo} - ${producto.descripcion} (${producto.activo ? 'ACTIVO' : 'INACTIVO'})`,
        }));

      this.listaProductos = productoLista; // <- asigna a la lista del componente

      try {
        localStorage.setItem('listaProductosTodos', JSON.stringify(productoLista));
      } catch (e) {
        console.warn('No se pudo guardar listaProductos en localStorage:', e);
      }

      // this.focusSeleccinar();
      this.tryFocusNgSelect();
      this.cargando.hide();
    }).catch(error => {
      console.error('Error al obtener productos:', error);
    });
  }

  obtenerDatosProducto(idProducto: any) {
    const productoEncontrado = this.listaProductos.find((producto: any) => producto.id === idProducto);
    this.producto = productoEncontrado;
    console.log('PRODUCTO ENCONTRADO: ', productoEncontrado);
    if (productoEncontrado) {
      this.obtenerIngresos(idProducto)
    }
  }

  onSeleccionar() {

  }

  buscarConCodigoDeBarra(): void {
    if (this.b.codigoBarra.value) {
      const barraBuscar = this.b.codigoBarra.value;
      const productoEncontrado = this.listaProductos.find((producto: any) => producto.codigoBarra === barraBuscar);
      console.log('PRODUCTO BARRA: ', productoEncontrado);

      if (productoEncontrado) {
        this.producto = productoEncontrado;
        this.obtenerIngresos(this.producto.id);
        this.b.codigoBarra.setValue('');
      } else {
        this.producto = null;
        this.listaIngresos = [];
        this.snackbar.open('NO SE ENCUENTRA', 'OK', { duration: 10000 });
        this.b.codigoBarra.setValue('');
      }
    }
  }

  obtenerIngresos(productoID: any): void {
    this.cargando.show();
    this.ingresoDetalleServicio.obtenerPorProductoParaVender(productoID).then((respuesta: any) => {
      console.log('INGRESOS DE PRODUCTOS: ', respuesta);
      this.totales = this.calculoServicio.sumarPorColumnas(respuesta);

      console.log('TOTALES: ', this.totales)
      this.listaIngresos = respuesta;
      this.precioVenta = this.calcularPrecioPromedioPv();
      this.cargando.hide();
    });
  }

  fotos(fila: any) {
    const dialogRef = this.dialog.open(ProductoFotosComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: fila.id,
        objeto: fila
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // this.obtenerConsulta();
      }
    });
  }

  resumen(fila: any) {
    const dialogRef = this.dialog.open(ProductoResumenComponent, {
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
        //this.obtenerConsulta();
      }
    });
  }

  barra() {
    const dialogRef = this.dialog.open(ProductoBarraComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: this.producto.id,
        objeto: this.producto
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this.obtenerConsulta();
      }
    });
  }

  imagenCargada(element: any) {
    element.loading = false;
    if (element.id) {
      this.imagenesCargadas.set(element.id, true);
    }
  }

  imprimir() {
    const dialogRef = this.dialog.open(ProductoImprimirComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: this.producto.id,
        objeto: this.producto
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this.obtenerConsulta();
      }
    });
  }

  calcularPrecioPromedioPv(): number {
    if (!this.listaIngresos || this.listaIngresos.length === 0) {
      return 0;
    }
    const suma = this.listaIngresos.reduce((total: any, ingreso: any) => total + (ingreso.pv || 0), 0);
    const promedio = suma / this.listaIngresos.length;
    return parseFloat(promedio.toFixed(2)); // redondea a 2 decimales
  }

  private tryFocusNgSelect(): void {
    // Espera al siguiente tick para que el input interno de ng-select exista,
    // especialmente si usas appendTo="body"
    setTimeout(() => {
      if (this.productoSelect) {
        this.productoSelect.focus(); // mueve el foco al input de búsqueda
        // opcional: abrir el dropdown
        // this.productoSelect.open();
      }
    }, 0);
  }

  nuevo() {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
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
        this.obtenerProductos();
      }
    });
  }

  editar(fila: any) {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
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
        this.producto = null;
        this.p.productoId.setValue(null)
        this.obtenerProductos();
      }
    });
  }
}
