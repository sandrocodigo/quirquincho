import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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


import { EgresoFormComponent } from '../egreso-form/egreso-form.component';
import { EgresoService } from '../../../servicios/egreso.service';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';

import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../servicios/auth.service';
import { FacturaService } from '../../../servicios/factura.service';
import { sucursales } from '../../../datos/sucursales';
import { EgresoTraspasoComponent } from '../egreso-traspaso/egreso-traspaso.component';


@Component({
  selector: 'app-egreso-lista',

  templateUrl: './egreso-lista.component.html',
  styleUrls: ['./egreso-lista.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
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
export class EgresoListaComponent {
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

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['codigo', 'sucursal', 'tipo', 'descripcion', 'total', 'opciones'];
  @ViewChild(MatSort) sort!: MatSort;

  usuario: any | null = null;

  listaSucursales = sucursales;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private cargando: SpinnerService,
    private egresoServicio: EgresoService,
    private facturaServicio: FacturaService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private titleService: Title,
    private authServicio: AuthService,
  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }
    });

    // const fechaGuardada = localStorage.getItem('fechaSeleccionada');
    // this.fechaHoy = fechaGuardada ? fechaGuardada : new Date().toISOString().split('T')[0];

    this.buscadorFormGroup = this.fb.group({
      sucursal: ['TODOS'],
      fechaInicio: [this.fechaHoy],
      fechaFinal: [this.fechaHoy],
      finalizado: ['TODOS'],
    });
    this.establecerSuscripcionForm();
    this.obtenerConsulta();
  }

  ngOnInit() {
    this.titleService.setTitle('Egresos');
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
    this.egresoServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then(res => {
      console.log('LISTA DE EGRESOS', res);

      const resultadosOrdenados = res.sort((a: any, b: any) => b.codigo - a.codigo);
      this.dataSource.data = resultadosOrdenados;

      this.lista = res;
      this.cargando.hide();
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(EgresoFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // console.log('RESULTADO: ',result.id);
        this.router.navigate(['/administracion/egresos/detalle/' + result.id]);
        // this.obtenerConsulta();
      }
    });
  }

  editar(fila: any): void {
    const dialogRef = this.dialog.open(EgresoFormComponent, {
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

  nuevoTraspaso(): void {
    const dialogRef = this.dialog.open(EgresoTraspasoComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // console.log('RESULTADO: ',result.id);
        this.router.navigate(['/administracion/egresos/detalle/' + result.id]);
        // this.obtenerConsulta();
      }
    });
  }

  editarTraspaso(fila: any): void {
    const dialogRef = this.dialog.open(EgresoTraspasoComponent, {
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
        titulo: 'FINALIZAR EGRESO',
        mensaje: 'Esta seguro de realizar esta accion?',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.egresoServicio.editar(fila.id, { finalizado: true }).then(resultado => {
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
        titulo: 'Eliminar Egreso',
        mensaje: 'Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.egresoServicio.eliminar(fila.id).then(result => {
          this.cargando.hide();
          this.snackbar.open('Eliminado...', 'OK', {
            duration: 10000
          });
          this.obtenerConsulta();
        })
      }
    });
  }


  facturar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Desea Facturar?',
        mensaje: 'Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.facturaServicio.crearConId({ idEgreso: fila.id }).then(result => {
          this.cargando.hide();
          this.snackbar.open('Facturado...', 'OK', {
            duration: 10000
          });
          //this.obtenerConsulta();
        })
      }
    });
  }

}
