import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { ArchivoSeleccionarComponent } from '../../archivos/archivo-seleccionar/archivo-seleccionar.component';
import { AuthService } from '../../../servicios/auth.service';
import { ProductoService } from '../../../servicios/producto.service';

@Component({
  selector: 'app-producto-fotos',
  templateUrl: './producto-fotos.component.html',
  styleUrls: ['./producto-fotos.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    DragDropModule

  ],
})
export class ProductoFotosComponent implements OnInit, OnDestroy {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  boton = false;

  usuarioSeleccionado: any;

  fotos: any[] = [];
  fotoSeleccionado: any = null;
  producto: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProductoFotosComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private auth: AuthService,
    private productoServicio: ProductoService,
  ) {

      this.producto = data.objeto;
      this.productoServicio.obtenerPorId(data.id).then(res => {

        this.fotos = Array.isArray(res?.fotosUrl) ? res.fotosUrl : [];

        if (this.fotos && this.fotos.length > 0) {
          this.fotoSeleccionado = this.fotos[0];
        }

        this.registroFormGroup = this.fb.group({
          fotosUrl: [this.fotos, [Validators.required]],
          edicionUsuario: [this.auth.obtenerUsuario.email],
          edicionFecha: [this.fechaHoy]
        });
        this.establecerSuscripcion();
      });


  }

  // INICIAR
  ngOnInit() {
    // this.fotos = [];

  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    /*     this.r.usuario.valueChanges.subscribe((val: any) => {
          this.usuarioSeleccionado = val;
        });
 */
  }

  // SELECCIONAR FOTO
  seleccionarFoto(): void {
    const dialogRef = this.dialog.open(ArchivoSeleccionarComponent, {
      width: '80%',
      data: {
        nuevo: true,
        objeto: null,
        clase: 'image'
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('FOTO SELECCIONADA: ', result);
      if (result) {
        const fotoSeleccionado = { fotoUrl: result.url };

        // console.log('FOTO SELECCIONADO: ', fotoSeleccionado);
        this.fotos.push(result);

        // console.log('LISTA: ', this.fotos);

        this.r.fotosUrl.setValue(this.fotos);
      }
    });
  }

  // REGISTRAR
  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Se requerie datos...', 'OK', {
        duration: 3000
      });
      return;
    } else {
      this.boton = true;
      if (this.data.nuevo) {

      } else {
        this.productoServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, actualizacion con exito...', 'OK', {
            duration: 10000
          });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }

    }
  }

  eliminar(fila: any): void {
    console.log('ELIMINAR: ', fila);
    if (fila && fila.id) {
      this.fotos = this.fotos.filter(item => item.id !== fila.id);


      console.log(" NUEVA LISTA: ", this.fotos  );
      this.r.fotosUrl.setValue(this.fotos);
    }
  }

  seleccionarImagen(item: any): void {
    this.fotoSeleccionado = item;
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.fotos, event.previousIndex, event.currentIndex);
  }

  ngOnDestroy() {
    // this.usuariosSubscription.unsubscribe();
  }
}
