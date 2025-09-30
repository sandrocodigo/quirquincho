import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


import { AuthService } from '../../../servicios/auth.service';
import { ProductoCategoriaService } from '../../../servicios/producto-categoria.service';
import { ProductoFabricanteService } from '../../../servicios/producto-fabricante.service';
import { ProductoService } from '../../../servicios/producto.service';
import { ProductoCategoriaComponent } from '../producto-categoria/producto-categoria.component';
import { ProductoFabricanteComponent } from '../producto-fabricante/producto-fabricante.component';
import { TituloService } from '../../../servicios/titulo.service';
import { ProveedorService } from '../../../servicios/proveedor.service';
import { ProveedorFormComponent } from '../../proveedores/proveedor-form/proveedor-form.component';


@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule

  ],
})
export class ProductoFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  boton = false;

  listaCategorias: any;
  listaFabricantes: any;
  listaProveedores: any;

  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProductoFormComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private auth: AuthService,
    private productoServicio: ProductoService,
    private pcServicio: ProductoCategoriaService,
    private pfServicio: ProductoFabricanteService,
    private proveedorServicio: ProveedorService,
    private tituloServicio: TituloService
  ) {

    if (data.nuevo) {
      const fechaNueva = new Date().toISOString().split('T')[0];
      const fechaActual = new Date();


      this.registroFormGroup = this.fb.group({
        fecha: [fechaNueva, [Validators.required]],

        tipo: [null, [Validators.required]],
        categoria: [null, [Validators.required]],
        fabricante: [null, [Validators.required]],
        proveedor: [null, [Validators.required]],
        proveedorCodigo: [null, [Validators.required]],

        codigo: [null, [Validators.required]],
        descripcion: [null, [Validators.required]],
        codigoBarra: [null, [Validators.required]],
        detalle: [null],
        precioServicio: [0],

        minimo: [0],

        fotosUrl: [
          [
            {
              "url": "https://firebasestorage.googleapis.com/v0/b/quirquinchopro.firebasestorage.app/o/productos%2Fsin-imagen.jpeg?alt=media&token=d47d2d22-cded-489b-b59b-91c03f350cda"
            }
          ]
        ],

        favorito: [false],
        publicado: [false],

        tituloLink: [],
        activo: [true],
        registroUsuario: [this.auth.obtenerUsuario.email],
        registroFecha: [this.fechaHoy]
      });
      this.establecerSuscripcion();
    } else {
      this.productoServicio.obtenerPorId(data.id).then(res => {
        this.registroFormGroup = this.fb.group({
          // fecha: [res.fecha, [Validators.required]],

          tipo: [res.tipo, [Validators.required]],
          categoria: [res.categoria, [Validators.required]],
          fabricante: [res.fabricante, [Validators.required]],

          proveedor: [res.proveedor, [Validators.required]],
          proveedorCodigo: [res.proveedorCodigo, [Validators.required]],

          codigo: [res.codigo, [Validators.required]],
          descripcion: [res.descripcion, [Validators.required]],
          codigoBarra: [res.codigoBarra, [Validators.required]],
          detalle: [res.detalle],
          precioServicio: [res.precioServicio],

          tituloLink: [res.tituloLink],

          favorito: [res.favorito],
          publicado: [res.publicado],

          minimo: [res.minimo],

          activo: [res.activo],
          edicionUsuario: [this.auth.obtenerUsuario.email],
          edicionFecha: [this.fechaHoy]
        });
        this.establecerSuscripcion();
      });
    }

  }

  // INICIAR
  ngOnInit() {
    this.obtenerCategorias();
    this.obtenerFabricantes();
    this.obtenerProveedores();
  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  // OBTENER CATEGORIAS
  obtenerCategorias() {
    this.pcServicio.obtenerTodos().then((data: any) => {
      this.listaCategorias = data;
    })
  }

  // OBTENER FABRICANTES
  obtenerFabricantes() {
    this.pfServicio.obtenerTodos().then((data: any) => {
      this.listaFabricantes = data;
    })
  }

  // OBTENER PROVEEDORES
  obtenerProveedores() {
    this.proveedorServicio.obtenerTodos().subscribe((res: any) => {
      this.listaProveedores = res;
    });
  }

  establecerSuscripcion() {
    this.r.codigo.valueChanges.subscribe((val: any) => {
      this.crearLink();
    });
    this.r.descripcion.valueChanges.subscribe((val: any) => {
      this.crearLink();
    });
  }

  crearLink() {
    const codigo = this.tituloServicio.convertir(this.r.codigo.value);
    const descripcion = this.tituloServicio.convertir(this.r.descripcion.value);
    //this.r.tituloLink.setValue(codigo + '-' + descripcion);
  }

  // REGISTRAR
  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Se requerie datos...', 'OK', { duration: 3000 });
      return;
    } else {
      this.boton = true;
      if (this.data.nuevo) {
        this.cargando.show();
        this.productoServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, registrado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      } else {
        this.productoServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, actualizacion con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }

    }
  }

  nuevoProveedor() {
    const dialogRef = this.dialog.open(ProveedorFormComponent, {
      width: '600px',
      data: {
        nuevo: true,
        id: null,
        objeto: null
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.id) {
        this.obtenerProveedores();
        this.proveedorServicio.obtenerPorId(result.id).then(res => {
          this.r.proveedor.setValue(res.empresa);
        })
      }
    });
  }

  nuevoCantegoria() {
    const dialogRef = this.dialog.open(ProductoCategoriaComponent, {
      width: '600px',
      data: {
        nuevo: true,
        id: null,
        objeto: null
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerCategorias();
      }
    });
  }

  nuevoFabricante() {
    const dialogRef = this.dialog.open(ProductoFabricanteComponent, {
      width: '600px',
      data: {
        nuevo: true,
        id: null,
        objeto: null
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerFabricantes();
      }
    });
  }

}
