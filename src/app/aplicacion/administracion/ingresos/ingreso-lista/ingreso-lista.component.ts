import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


import { IngresoFormComponent } from '../ingreso-form/ingreso-form.component';
import { IngresoService } from '../../../servicios/ingreso.service';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '../../../servicios/auth.service';
import { sucursales } from '../../../datos/sucursales';


@Component({
  selector: 'app-ingreso-lista',
  templateUrl: './ingreso-lista.component.html',
  styleUrls: ['./ingreso-lista.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatTooltip,
    MatMenuModule
  ],
})
export class IngresoListaComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;
  lista: any;

  fechaHoy = new Date().toISOString().split('T')[0];
  // Obtener la fecha actual
  hoy = new Date();
  // Crear una nueva fecha con el primer día del mes actual
  primerDiaDelMes = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1);
  // Formatear la fecha al formato "YYYY-MM-DD"
  fechaInicial = this.primerDiaDelMes.toISOString().split('T')[0];

  // DataSource para la tabla
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['codigo', 'sucursal', 'tipo', 'descripcion', 'total', 'opciones'];
  @ViewChild(MatSort) sort!: MatSort;

  usuario: any | null = null;
  listaSucursales = sucursales;
  
  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private cargando: SpinnerService,
    private ingresoServicio: IngresoService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private authServicio: AuthService,
    public router: Router,
  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }
    });

    // const fechaGuardada = localStorage.getItem('fechaSeleccionada');
    // this.fechaHoy = fechaGuardada ? fechaGuardada : new Date().toISOString().split('T')[0];

    this.buscadorFormGroup = this.fb.group({
      sucursal: ['TODOS'],
      fechaInicio: [this.fechaInicial],
      fechaFinal: [this.fechaHoy],
      finalizado: ['TODOS'],
    });
    this.establecerSuscripcionForm();
    this.obtenerConsulta();
  }

  ngOnInit() {
    this.titleService.setTitle('Ingresos de Productos');
    // this.establecerSuscripcion();
    // this.buscarPorFechaYTurno();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // FORM
  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.sucursal.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.finalizado.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.fechaInicio.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.fechaFinal.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
  }

  // OBTENER CONSULAR
  obtenerConsulta() {
    this.cargando.show();
    this.ingresoServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then(res => {
      // console.log('LISTA DE INGRESOS', res);
      const resultadosOrdenados = res.sort((a: any, b: any) => b.codigo - a.codigo);
      this.dataSource.data = resultadosOrdenados;
      this.cargando.hide();
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(IngresoFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/administracion/ingresos/detalle/' + result.id]);
        //this.obtenerConsulta();
      }
    });
  }

  editar(fila: any): void {
    const dialogRef = this.dialog.open(IngresoFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        idUsuario: fila.usuarioId,
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

  finalizar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'APROBAR INGRESO',
        mensaje: 'Esta seguro de realizar esta accion?',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.ingresoServicio.editar(fila.id, { aprobado: true }).then(resultado => {
          this.cargando.hide();
          this.snackbar.open('FINALIZADO', 'OK', {
            duration: 10000
          });
          this.obtenerConsulta();
        })
      }
    });
  }


  eliminar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Ingreso',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.ingresoServicio.editar(fila.id, { activo: false, usuarioElimina: this.usuario.email }).then(result => {
          this.cargando.hide();
          this.snackbar.open('Eliminado...', 'OK', { duration: 10000 });
          this.obtenerConsulta();
        })
      }
    });
  }

}
