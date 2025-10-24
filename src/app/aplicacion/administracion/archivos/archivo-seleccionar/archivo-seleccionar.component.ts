import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';



@Component({
  selector: 'app-archivo-seleccionar',

  templateUrl: './archivo-seleccionar.component.html',
  styleUrls: ['./archivo-seleccionar.component.scss'],
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
export class ArchivoSeleccionarComponent {
  pagina: any[] = [];
  clase: any;
  pageSize = 12;
  pageSizeOptions = [6, 12, 24, 48];
  stackCursors: QueryDocumentSnapshot<DocumentData>[] = [];
  lastCursor: QueryDocumentSnapshot<DocumentData> | null = null;

  constructor(
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private archivoServicio: ArchivoService,
    public dialogRef: MatDialogRef<ArchivoSeleccionarComponent>, @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.clase = data.clase;
  }

  ngOnInit(): void {
    this.cargarPrimeraPagina();
  }

  async cargarPrimeraPagina() {
    this.cargando.show();
    try {
      const { items, last } = await this.archivoServicio.obtenerPaginaPorClase(this.pageSize, this.clase);
      this.pagina = items;
      this.stackCursors = [];
      this.lastCursor = last;
    } finally {
      this.cargando.hide();
    }
  }

  async siguiente() {
    if (!this.lastCursor) {
      return;
    }
    this.cargando.show();
    try {
      const { items, last } = await this.archivoServicio.obtenerPaginaPorClase(this.pageSize, this.clase, this.lastCursor);
      if (this.lastCursor) {
        this.stackCursors.push(this.lastCursor);
      }
      this.pagina = items;
      this.lastCursor = last;
    } finally {
      this.cargando.hide();
    }
  }

  async anterior() {
    if (!this.stackCursors.length) {
      return;
    }
    const prevAnchor = this.stackCursors.length > 1 ? this.stackCursors.at(-2)! : undefined;
    this.cargando.show();
    try {
      const { items, last } = await this.archivoServicio.obtenerPaginaPorClase(this.pageSize, this.clase, prevAnchor);
      this.stackCursors.pop();
      this.pagina = items;
      this.lastCursor = last;
    } finally {
      this.cargando.hide();
    }
  }

  onChangePageSize(size: number) {
    this.pageSize = size;
    this.cargarPrimeraPagina();
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
      this.cargarPrimeraPagina();
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
          this.cargarPrimeraPagina();
        })
      }
    });
  }

  seleccionar(filaSeccionada: any) {
    this.dialogRef.close(filaSeccionada);
  }

}
