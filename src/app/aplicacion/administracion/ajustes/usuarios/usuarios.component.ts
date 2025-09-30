import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// Importa el servicio de funciones de Firebase de esta manera
import { Functions, getFunctions, httpsCallable } from '@angular/fire/functions';
import { } from '@angular/fire/functions';

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


import { RouterModule } from '@angular/router';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltip } from '@angular/material/tooltip';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { AuthService } from '../../../servicios/auth.service';
import { UsuarioService } from '../../../servicios/usuario.service';
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';
import { UsuarioRegistroComponent } from './usuario-registro/usuario-registro.component';
import { PermisoAccesoComponent } from './permiso-acceso/permiso-acceso.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
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
export class UsuariosComponent {
  usuario: any | null = null;

  // DataSource para la tabla
  dataSource = new MatTableDataSource<any>([]);

  // Nombre de las columnas que se mostrarán
  displayedColumns: string[] = ['email', 'adminTipo', 'sucursal', 'activo', 'opciones'];

  // ViewChild para manejar el ordenamiento
  @ViewChild(MatSort) sort!: MatSort;


  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private functions: Functions,
    private cargando: SpinnerService,
    private usuarioServicio: UsuarioService,
    private authServicio: AuthService,
    private titleService: Title

  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }

      this.obtenerConsulta();
    });


  }

  ngOnInit(): void {
    this.titleService.setTitle('Usuarios');
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }


  obtenerConsulta(): void {
    this.cargando.show();
    this.usuarioServicio.obtenerConsulta({}).then((respuesta: any) => {
      console.log('USUARIOS: ', respuesta);
      this.dataSource.data = respuesta;
      this.cargando.hide();
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(UsuarioRegistroComponent, {
      width: '500px',
      data: {
        nuevo: true,
        id: null,
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
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
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
        /*         this.productoServicio.editar(fila.id, { activo: false, usuarioElimina: this.usuario.email }).then(result => {
                  this.cargando.hide();
                  this.snackbar.open('Eliminado...', 'OK', { duration: 10000 });
                  this.obtenerConsulta();
                }) */
      }
    });
  }

  permisoAcceso(fila: any) {
    const dialogRef = this.dialog.open(PermisoAccesoComponent, {
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
