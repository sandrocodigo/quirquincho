import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../../servicios/cliente.service';
import { ClienteFormComponent } from '../cliente-form/cliente-form.component';
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

@Component({
  selector: 'app-cliente-lista',
  templateUrl: './cliente-lista.component.html',
  styleUrls: ['./cliente-lista.component.scss'],
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
export class ClienteListaComponent {

  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  // DataSource para la tabla
  dataSource = new MatTableDataSource<any>([]);

  // Nombre de las columnas que se mostrarán
  displayedColumns: string[] = ['empresa', 'opciones'];

  // ViewChild para manejar el ordenamiento
  @ViewChild(MatSort) sort!: MatSort;

  limites = limites;
  usuario: any | null = null;
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private titleService: Title,
    private cargando: SpinnerService,
    private clienteServicio: ClienteService,
    private authServicio: AuthService,
  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
      }
    });

    this.buscadorFormGroup = this.fb.group({
      // cliente: ['TODOS'],
      activo: ['true'],
      limite: [50],
    });
    this.obtenerConsulta();
    this.establecerSuscripcionForm();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Clientes');
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

  // OBTENER CONSULAR
  obtenerConsulta() {
    this.cargando.show();
    this.clienteServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then(res => {
      console.log('CONSULTA', res);
      this.dataSource.data = res;
      this.cargando.hide();
    });
  }

  // NUEVO
  nuevo(): void {
    const dialogRef = this.dialog.open(ClienteFormComponent, {
      width: '80%',
      data: {
        nuevo: true,
        objeto: null
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.obtenerConsulta();
      if (result) {
        // this.obtener();
      }
    });
  }

  // EDIATR
  editar(fila: any): void {
    const dialogRef = this.dialog.open(ClienteFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        objeto: fila,
        id: fila.id
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerConsulta();
        // this.router.navigate(['/proyectos/lista']);
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
        this.clienteServicio.editar(fila.id, { activo: false, usuarioElimina: this.usuario.email }).then(result => {
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
