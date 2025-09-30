import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ArchivoFormComponent } from '../archivo-form/archivo-form.component';

// MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ArchivoService } from '../../../servicios/archivo.service';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { ArchivoEditarComponent } from '../archivo-editar/archivo-editar.component';


@Component({
  selector: 'app-archivo',
  templateUrl: './archivo.component.html',
  styleUrls: ['./archivo.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatDividerModule,
    MatDialogModule,
    MatProgressBarModule
  ],
})
export class ArchivoComponent {

  lista: any;
  constructor(
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private archivoServicio: ArchivoService
  ) { }

  ngOnInit(): void {
    this.listar();
  }

  listar() {
    this.cargando.show();
    this.archivoServicio.obtenerTodos().then((res: any) => {
      console.log('LISTA: ', res);
      this.lista = res
      this.cargando.hide();
    });
  }

  // NUEVO
  nuevo(): void {
    const dialogRef = this.dialog.open(ArchivoFormComponent, {
      width: '80%',
      data: {
        nuevo: true,
        objeto: null
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.listar();
      if (result) {
        // this.obtener();
      }
    });
  }

  /*
  applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    } */

  editar(fila: any): void {
    const dialogRef = this.dialog.open(ArchivoEditarComponent, {
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
        this.listar();
      }
    });
  }

  eliminar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Archivo',
        mensaje: 'Esta seguro de realizar esta accion?',
        nota: 'Se eliminara por completo el registro del archivo'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.archivoServicio.eliminar(fila.id).then(result => {
          this.snackbar.open('Archivo eliminado...', 'OK', {
            duration: 10000
          });
          this.listar();
        })
      }
    });
  }
}
