import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
 

import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

// ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

 
import { ProductoService } from '../../../servicios/producto.service';
import { limites } from '../../../datos/limites';
import { Title } from '@angular/platform-browser';
import { ProductoCategoriaService } from '../../../servicios/producto-categoria.service';
import { ProductoFormComponent } from '../../productos/producto-form/producto-form.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { AuthService } from '../../../servicios/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

@Component({
  selector: 'app-gestion-producto',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './gestion-producto.component.html',
  styleUrl: './gestion-producto.component.scss',
   
})
export class GestionProductoComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  lista: any[] = [];
  listaOriginal: any[] = [];

  fechaHoy = new Date().toISOString().split('T')[0];

  totales: any;

  totalDineroPorFecha: any[] = [];

  listaCategorias: any;
  tipos = ['PRODUCTO','COMIDA', 'SERVICIO', 'INSUMO'];
  limites = limites;

  @ViewChild('tabla') tabla!: ElementRef;
  usuario: any | null = null;

  constructor(
    private fb: FormBuilder,
    private cargando:  SpinnerService,
    private productoServicio: ProductoService,
    private pcServicio: ProductoCategoriaService,
    private titleService: Title,
    private authServicio: AuthService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,
  ) {
    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }
    });

    this.buscadorFormGroup = this.fb.group({

      descripcion: [''],

      activo: ['true'],
      tipo: ['TODOS'],
      publicado: ['TODOS'],
      categoria: ['TODOS'],
      limite: [500],
    });
    this.establecerSuscripcionForm();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Gestion de Productos');
    this.obtenerCategorias();
  }

  // FORM
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

  obtenerCategorias() {
    this.pcServicio.obtenerTodos().then((data: any) => {
      this.listaCategorias = data;
    })
  }


  obtenerConsulta(): void {
    this.cargando.show();
    this.productoServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {
      console.log('CONSULTA CON SALDO: ', respuesta);
      // this.dataSource.data = respuesta;
      this.lista = respuesta; // Asigna la lista de resultados
      this.listaOriginal = [...respuesta]; // Guarda una copia de la lista original
      this.cargando.hide();
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
  buscarEnJson(jsonData: any[], searchTerm: string): any[] {
    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    return jsonData.filter(item =>
      Object.values(item).some(value =>
        (value ?? '').toString().toLowerCase().includes(lowerSearchTerm)
      )
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    if (!filterValue.trim()) {
      // Si el filtro está vacío, restaura la lista original
      this.lista = [...this.listaOriginal];
    } else {
      // Filtra la lista
      this.lista = this.buscarEnJson(this.listaOriginal, filterValue);
    }
  }

  copiar(fila: any) {
    const hoy = new Date();
    const producto = { ...fila };

    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Copiar producto para crear uno nuevo: ' + fila.codigo,
        mensaje: '¿Está seguro de realizar esta acción?',
        nota: '...',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargando.show();
        delete producto.id;

        producto.usuarioRegistro = this.usuario.email;
        producto.fechaRegistro = hoy;

        producto.pc = 0;
        producto.pv = 0;
        producto.cantidadTotal = 0;

        // Crear la nueva cotización
        this.productoServicio.crear(producto).then((productoNuevo: any) => {
          // console.log('ID COTIZACION:', nuevoCotizacion.id);
          this.obtenerConsulta();
        });
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

}
