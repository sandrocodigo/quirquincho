import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { limites } from '../../../datos/limites';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../servicios/auth.service';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { UsuarioService } from '../../../servicios/usuario.service';

import { TarifaFormComponent } from '../tarifa-form/tarifa-form.component';
import { TarifaService } from '../../../servicios/tarifa.service';

@Component({
  selector: 'app-tarifa-lista',
  templateUrl: './tarifa-lista.component.html',
  styleUrl: './tarifa-lista.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatDividerModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule
  ],
})
export class TarifaListaComponent {

  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  usuario: any | null = null;
  usuarioDatos: any;

  limites = limites;

  // DataSource para la tabla
  dataSource = new MatTableDataSource<any>([]);

  // Nombre de las columnas que se mostrarán
  displayedColumns: string[] = ['origen', 'destino', 'precio1', 'precio2', 'precio3', 'opciones'];

  // ViewChild para manejar el ordenamiento
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    private usuarioServicio: UsuarioService,
    private tarifaServicio: TarifaService,
    private titleService: Title,
    private snackbar: MatSnackBar,
  ) {
    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        this.obtenerUsuario();
        // console.log('USUARIO', user);

      }
    });

    this.buscadorFormGroup = this.fb.group({
      activo: ['true'],
      limite: [50],
    });

    this.obtenerConsulta();
    this.establecerSuscripcionForm();

  }

  ngOnInit(): void {
    this.titleService.setTitle('Vehiculos');
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // FORM
  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.activo.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.limite.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
  }

  obtenerUsuario() {
    this.cargando.show();
    this.usuarioServicio.obtenerPorId(this.usuario.email).then((data: any) => {
      this.usuarioDatos = data;
      console.log('USUARIO', data);
      //this.obtenerConsulta();
    });
  }

  // OBTENER CONSULAR
  obtenerConsulta() {
    this.cargando.show();
    this.tarifaServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then(res => {
      console.log('CONSULTA', res);
      this.dataSource.data = res;
      this.cargando.hide();
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(TarifaFormComponent, {
      width: '500px',
      data: {
        nuevo: true,
        usuario: this.usuarioDatos,
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

  editar(fila: any): void {
    const dialogRef = this.dialog.open(TarifaFormComponent, {
      width: '500px',
      data: {
        nuevo: false,
        usuario: this.usuarioDatos,
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

  eliminar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Cliente',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.tarifaServicio.editar(fila.id, { activo: false, usuarioElimina: this.usuario.email }).then(result => {
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
}
