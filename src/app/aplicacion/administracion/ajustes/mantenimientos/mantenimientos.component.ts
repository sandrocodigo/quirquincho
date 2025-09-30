import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { MantenimientoService } from '../../../servicios/mantenimiento.service';
import { AuthService } from '../../../servicios/auth.service';
import { MantenimientoFormComponent } from './mantenimiento-form/mantenimiento-form.component';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

@Component({
  selector: 'app-mantenimientos',
  templateUrl: './mantenimientos.component.html',
  styleUrl: './mantenimientos.component.scss',
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
export class MantenimientosComponent {

  usuario: any | null = null;

  // DataSource para la tabla
  dataSource = new MatTableDataSource<any>([]);

  // Nombre de las columnas que se mostrarán
  displayedColumns: string[] = ['id', 'tipo', 'descripcion', 'frecuencia', 'kilometraje', 'opciones'];

  // ViewChild para manejar el ordenamiento
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private mantenimientoService: MantenimientoService,
    private authServicio: AuthService,
    private titleService: Title

  ) {
    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }
      this.obtenerConsulta();
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Mantenimientos');
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  obtenerConsulta(): void {
    this.cargando.show('Cargando Tipos de Mantemiento...');
    this.mantenimientoService.obtenerTodos().then((respuesta: any) => {
      console.log('MANTENIMIENTOS: ', respuesta);
      this.dataSource.data = respuesta.sort((a: any, b: any) => {
        return Number(a.id) - Number(b.id);
      });
      this.cargando.hide();
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(MantenimientoFormComponent, {
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
    const dialogRef = this.dialog.open(MantenimientoFormComponent, {
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
    const dialogRef = this.dialog.open(MantenimientoFormComponent, {
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
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
