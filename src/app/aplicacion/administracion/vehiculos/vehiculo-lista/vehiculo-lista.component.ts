import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { VehiculoFormComponent } from '../vehiculo-form/vehiculo-form.component';
import { UsuarioService } from '../../../servicios/usuario.service';
import { VehiculoService } from '../../../servicios/vehiculo.service';
import { MatMenuModule } from '@angular/material/menu';
import { vehiculoEmpresas } from '../../../datos/vehiculo-empresas';


@Component({
  selector: 'app-vehiculo-lista',
  templateUrl: './vehiculo-lista.component.html',
  styleUrl: './vehiculo-lista.component.scss',
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
    MatSortModule,
    MatMenuModule
  ],

  // encapsulation: ViewEncapsulation.None,
})
export class VehiculoListaComponent {

  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  usuario: any | null = null;
  usuarioDatos: any;

  limites = limites;

  // DataSource para la tabla
  dataSource = new MatTableDataSource<any>([]);

  // Nombre de las columnas que se mostrarán
  displayedColumns: string[] = ['numero', 'placa', 'modelo', 'conductor', 'activo', 'opciones'];

  // ViewChild para manejar el ordenamiento
  @ViewChild(MatSort) sort!: MatSort;

  lista: any[] = [];
  listaOriginal: any[] = [];

  listaEmpresas = vehiculoEmpresas;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    private usuarioServicio: UsuarioService,
    private vehiculoServicio: VehiculoService,
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
      empresa: ['TODOS'],
      activo: ['true'],
      limite: [100],
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
    this.b.empresa.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
  }

  obtenerUsuario() {
    this.usuarioServicio.obtenerPorId(this.usuario.email).then((data: any) => {
      this.usuarioDatos = data;
      console.log('USUARIO', data);


      //this.obtenerConsulta();
    });
  }

  // OBTENER CONSULAR
  obtenerConsulta() {
    this.cargando.show('Obtieniendo datos...');
    this.vehiculoServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then(res => {
      this.cargando.hide();
      console.log('CONSULTA', res);

      const resultadosOrdenados = res.sort((a: any, b: any) => b.numero - a.numero);
      this.dataSource.data = resultadosOrdenados;

      this.lista = resultadosOrdenados; // Asigna la lista de resultados
      this.listaOriginal = [...resultadosOrdenados]; // Guarda una copia de la lista original

    });
  }

  actualizar() {
    this.cargando.show('Actualizando datos...');
    this.lista.forEach(item => {
      this.vehiculoServicio.editar(item.id, { empresa: item.modelo }).then(res => {
        console.log('Actualizado', res);
        this.cargando.hide();
      });
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(VehiculoFormComponent, {
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
    const dialogRef = this.dialog.open(VehiculoFormComponent, {
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
        titulo: 'Eliminar Vehiculo',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.vehiculoServicio.editar(fila.id, { activo: false, usuarioElimina: this.usuario.email }).then(result => {
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
