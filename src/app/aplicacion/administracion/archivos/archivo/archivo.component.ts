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
import { DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';


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

  pagina: any[] = [];


  pageSize = 20;

  // Pila de cursores (último doc de cada página para poder retroceder)
  stackCursors: QueryDocumentSnapshot<DocumentData>[] = [];
  // Último doc de la página actual (sirve para "siguiente")
  lastCursor: QueryDocumentSnapshot<DocumentData> | null = null;

  pageSizeOptions = [12, 20, 40, 80];

  constructor(
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private archivoServicio: ArchivoService
  ) { }

  ngOnInit(): void {
    this.cargarPrimeraPagina();
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
      data: { nuevo: true, objeto: null },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(ok => { if (ok) this.cargarPrimeraPagina(); });
  }

  editar(fila: any): void {
    const dialogRef = this.dialog.open(ArchivoEditarComponent, {
      width: '800px',
      data: { nuevo: false, idUsuario: fila.usuarioId, id: fila.id },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(ok => { if (ok) this.cargarPrimeraPagina(); });
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

  // Carga primera página y reinicia historial
  async cargarPrimeraPagina() {
    this.cargando.show();
    const { items, last } = await this.archivoServicio.obtenerPagina(this.pageSize);
    this.pagina = items;
    this.stackCursors = [];
    this.lastCursor = last;
    this.cargando.hide();
  }

  async siguiente() {
    if (!this.lastCursor) return; // no hay más
    this.cargando.show();
    const { items, last } = await this.archivoServicio.obtenerPagina(this.pageSize, this.lastCursor);
    // Guarda el cursor de la página actual para poder volver
    if (this.lastCursor) this.stackCursors.push(this.lastCursor);
    this.pagina = items;
    this.lastCursor = last;
    this.cargando.hide();
  }

  async anterior() {
    if (!this.stackCursors.length) return; // ya estás en la primera
    // El cursor "ancla" para reconstruir la página previa es el último de la pila - 1
    const prevAnchor = this.stackCursors.length > 1 ? this.stackCursors.at(-2)! : undefined;

    this.cargando.show();
    const { items, last } = await this.archivoServicio.obtenerPagina(this.pageSize, prevAnchor);
    this.pagina = items;
    // Quita el cursor de la página que abandonas
    this.stackCursors.pop();
    this.lastCursor = last;
    this.cargando.hide();
  }

  onChangePageSize(size: number) {
    this.pageSize = size;
    this.cargarPrimeraPagina(); // reinicia con nuevo tamaño
  }

}
