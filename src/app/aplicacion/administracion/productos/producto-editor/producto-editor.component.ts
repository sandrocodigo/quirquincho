import { Component, Inject } from '@angular/core';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { QuillModule } from 'ngx-quill';
import { AuthService } from '../../../servicios/auth.service';
import { ProductoService } from '../../../servicios/producto.service';


@Component({
  selector: 'app-producto-editor',
  templateUrl: './producto-editor.component.html',
  styleUrl: './producto-editor.component.scss',
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

    // QUILL
    QuillModule
  ],
})
export class ProductoEditorComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  boton = false;

  listaCategorias: any;
  listaFabricantes: any;

  tipos = ['PRODUCTO', 'SERVICIO'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProductoEditorComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private auth: AuthService,
    private productoServicio: ProductoService,
  ) {

    this.productoServicio.obtenerPorId(data.id).then(res => {
      this.registroFormGroup = this.fb.group({

        detalle: [res.detalle],

        edicionDetalleUsuario: [this.auth.obtenerUsuario.email],

      });
      this.establecerSuscripcion();
    });

  }

  // INICIAR
  ngOnInit() {

  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }


  establecerSuscripcion() {

    /*     this.r.descripcion.valueChanges.subscribe((val: any) => {
          const nuevoDato = this.tituloServicio.convertir(val);
          this.r.tituloLink.setValue(nuevoDato);
        }); */

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

      this.productoServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
        this.snackbar.open('Hey!, actualizacion con exito...', 'OK', { duration: 10000 });
        this.dialogRef.close(true);
        this.cargando.hide();
      });


    }
  }

}
