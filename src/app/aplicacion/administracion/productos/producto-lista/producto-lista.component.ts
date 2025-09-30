import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';


import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { ProductoFotosComponent } from '../producto-fotos/producto-fotos.component';
import { ProductoResumenComponent } from '../producto-resumen/producto-resumen.component';
import { ProductoService } from '../../../servicios/producto.service';
import { RouterModule } from '@angular/router';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltip } from '@angular/material/tooltip';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { AuthService } from '../../../servicios/auth.service';
import { limites } from '../../../datos/limites';
import { ProductoCategoriaService } from '../../../servicios/producto-categoria.service';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-producto-lista',
  templateUrl: './producto-lista.component.html',
  styleUrls: ['./producto-lista.component.scss'],
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
    MatTooltip,
    MatMenuModule
  ],
})
export class ProductoListaComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];
  limites = limites;

  filtro = false;

  usuario: any | null = null;

  listaCategorias: any;

  // DataSource para la tabla
  dataSource = new MatTableDataSource<any>([]);

  // Nombre de las columnas que se mostrarán
  displayedColumns: string[] = ['foto', 'codigo', 'codigoBarra', 'pv', 'cantidadTotal', 'opciones'];

  // ViewChild para manejar el ordenamiento
  @ViewChild(MatSort) sort!: MatSort;

  lista: any[] = [];
  listaOriginal: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private productoServicio: ProductoService,
    private authServicio: AuthService,
    private pcServicio: ProductoCategoriaService,
    private titleService: Title,
    private breakpointObserver: BreakpointObserver

  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }
    });

    this.buscadorFormGroup = this.fb.group({

      activo: ['true'],
      tipo: ['TODOS'],
      publicado: ['TODOS'],
      categoria: ['TODOS'],
      limite: [1000],
    });
    // this.obtenerConsulta();
    this.establecerSuscripcionForm();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Productos');

    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.filtro = !result.matches;
      // console.log('Filtro:', this.filtro); // `true` si la pantalla es menor o igual a 768px
    });

    this.obtenerCategorias()
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.categoria.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.tipo.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.activo.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.publicado.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.limite.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
  }

  // OBTENER CATEGORIAS
  obtenerCategorias() {
    this.pcServicio.obtenerTodos().then((data: any) => {
      this.listaCategorias = data;
    })
  }

  obtenerConsulta(): void {
    this.cargando.show();
    this.productoServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {
      console.log('CONSULTA CON SALDO: ', respuesta);

      const resultadosOrdenados = respuesta
        .sort((a: any, b: any) => b.codigo - a.codigo)
        .map((item: any) => ({
          ...item,
          loading: true // 🔹 Agregamos estado de carga por imagen
        }));

      this.dataSource.data = resultadosOrdenados;
      this.lista = resultadosOrdenados;
      this.listaOriginal = [...resultadosOrdenados];

      this.cargando.hide();
    });
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
        this.obtenerConsulta();
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
        this.obtenerConsulta();
      }
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
        this.obtenerConsulta();
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

  eliminar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Producto',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.productoServicio.editar(fila.id, { activo: false, usuarioElimina: this.usuario.email }).then(result => {
          this.cargando.hide();
          this.snackbar.open('Eliminado...', 'OK', { duration: 10000 });
          this.obtenerConsulta();
        })
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  filtros() {
    this.filtro = !this.filtro;
  }


  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    if (!filterValue.trim()) {
      // Si el filtro está vacío, restaura la lista original
      this.lista = [...this.listaOriginal];
    } else {
      // Filtra la lista
      this.lista = this.buscarEnJson(this.listaOriginal, filterValue);
    }
  }

  buscarEnJson(jsonData: any[], searchTerm: string): any[] {
    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    return jsonData.filter(item =>
      Object.values(item).some(value =>
        (value ?? '').toString().toLowerCase().includes(lowerSearchTerm)
      )
    );
  }

}
