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
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { ProductoFotosComponent } from '../producto-fotos/producto-fotos.component';
import { ProductoResumenComponent } from '../producto-resumen/producto-resumen.component';
import { ProductoService } from '../../../servicios/producto.service';
import { RouterModule } from '@angular/router';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { AuthService } from '../../../servicios/auth.service';
import { ProductoCategoriaService } from '../../../servicios/producto-categoria.service';

import { BreakpointObserver } from '@angular/cdk/layout';
import { DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';

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
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule
  ],
})
export class ProductoListaComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];
  filtro = false;

  usuario: any | null = null;

  listaCategorias: any;

  // DataSource para la tabla
  dataSource = new MatTableDataSource<any>([]);

  // Nombre de las columnas que se mostrarán
  displayedColumns: string[] = ['foto', 'codigo', 'descripcion', 'clasificacion', 'activo', 'opciones'];

  // ViewChild para manejar el ordenamiento
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  lista: any[] = [];
  listaOriginal: any[] = [];
  pageSizeOptions: number[] = [10, 20, 50, 100];
  pageSize = this.pageSizeOptions[1];
  resultsLength = 0;
  isLoadingResults = false;
  currentPageIndex = 0;
  private pageAnchors: (QueryDocumentSnapshot<DocumentData> | null)[] = [null];
  private currentFilters: any = {};

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
      limite: [this.pageSize],
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

    this.obtenerCategorias();
    this.obtenerConsulta();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    if (this.paginator) {
      this.paginator.pageSize = this.pageSize;
    }
  }

  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.categoria.valueChanges.subscribe((val: any) => {
      this.onFiltersChanged();
    });
    this.b.tipo.valueChanges.subscribe((val: any) => {
      this.onFiltersChanged();
    });
    this.b.activo.valueChanges.subscribe((val: any) => {
      this.onFiltersChanged();
    });
    this.b.publicado.valueChanges.subscribe((val: any) => {
      this.onFiltersChanged();
    });
    this.b.limite.valueChanges.subscribe((val: any) => {
      const parsed = Number(val);
      if (!parsed || parsed <= 0) {
        return;
      }
      this.onPageSizeSelect(parsed);
    });
  }

  // OBTENER CATEGORIAS
  obtenerCategorias() {
    this.pcServicio.obtenerTodos().then((data: any) => {
      this.listaCategorias = data;
    })
  }

  obtenerConsulta(): void {
    this.loadPage(0, this.pageSize, true);
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
      this.dataSource.data = [...this.listaOriginal];
    } else {
      // Filtra la lista
      this.lista = this.buscarEnJson(this.listaOriginal, filterValue);
      this.dataSource.data = this.lista;
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

  async onPageChange(event: PageEvent) {
    if (event.pageSize !== this.pageSize) {
      this.onPageSizeSelect(event.pageSize);
      return;
    }
    await this.loadPage(event.pageIndex, event.pageSize);
  }

  private async onPageSizeSelect(size: number) {
    this.pageSize = size;
    if (this.paginator) {
      this.paginator.firstPage();
    } else {
      this.currentPageIndex = 0;
    }
    this.b.limite.setValue(size, { emitEvent: false });
    await this.loadPage(0, this.pageSize, true);
  }

  private async onFiltersChanged() {
    await this.loadPage(0, this.pageSize, true);
  }

  private obtenerFiltrosLimpiados() {
    const { limite, ...resto } = this.buscadorFormGroup.getRawValue();
    return resto;
  }

  private async loadPage(pageIndex: number, pageSize: number, resetAnchors = false) {
    this.isLoadingResults = true;
    this.cargando.show();
    if (resetAnchors) {
      this.pageAnchors = [null];
      this.currentPageIndex = 0;
      this.currentFilters = this.obtenerFiltrosLimpiados();
    }

    let hasValidCount = true;
    try {
      if (resetAnchors) {
        try {
          this.resultsLength = await this.productoServicio.obtenerConteoProductos(this.currentFilters);
        } catch (error) {
          console.warn('No fue posible obtener el conteo total de productos:', error);
          hasValidCount = false;
          this.resultsLength = 0;
        }
      }

      const cursor = pageIndex > 0 ? this.pageAnchors[pageIndex] ?? undefined : undefined;
      const { items, last } = await this.productoServicio.obtenerPaginaProductos(
        this.currentFilters,
        pageSize,
        cursor
      );

      const resultados = items.map((item: any) => ({
        ...item,
        loading: true
      }));

      this.lista = resultados;
      this.listaOriginal = [...resultados];
      this.dataSource.data = resultados;
      this.currentPageIndex = pageIndex;
      if (!hasValidCount) {
        const estimado = pageIndex * pageSize + (last ? pageSize * 2 : resultados.length);
        this.resultsLength = Math.max(this.resultsLength, estimado);
      } else {
        this.resultsLength = resetAnchors && !this.resultsLength
          ? resultados.length
          : Math.max(this.resultsLength, pageIndex * pageSize + resultados.length);
      }

      if (this.paginator) {
        this.paginator.pageIndex = pageIndex;
        this.paginator.pageSize = pageSize;
        this.paginator.length = this.resultsLength;
      }

      if (last) {
        this.pageAnchors[pageIndex + 1] = last;
      } else {
        this.pageAnchors = this.pageAnchors.slice(0, pageIndex + 1);
      }
    } finally {
      this.isLoadingResults = false;
      this.cargando.hide();
    }
  }

}
