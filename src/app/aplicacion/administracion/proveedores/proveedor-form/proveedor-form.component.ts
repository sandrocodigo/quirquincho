import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClienteService } from '../../../servicios/cliente.service';

import { ProveedorService } from '../../../servicios/proveedor.service';


@Component({
  selector: 'app-proveedor-form',
  templateUrl: './proveedor-form.component.html',
  styleUrl: './proveedor-form.component.scss',
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
  ],
})
export class ProveedorFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;

  id: any;

  fechaHoy = new Date();

  locaciones = ['NACIONAL', 'EXTRANJERO'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProveedorFormComponent>,
    private fb: FormBuilder,
    private proveedorServicio: ProveedorService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
  ) {

    this.id = data.id;

    if (data.nuevo) {
      // FORM NUEVO

      this.registroFormGroup = this.fb.group({

        locacion: [null, [Validators.required]],
        empresa: [null, [Validators.required, Validators.minLength(3)]],
        responsable: [null, [Validators.required, Validators.minLength(3)]],
        email: [null, [Validators.required, Validators.email]],
        telefono: [null, [Validators.required]],

        descripcion: [null, [Validators.required]],

        usuarioEditorEmail: [],
        fechaRegistro: [this.fechaHoy]
      });


    } else {
      // FORM EDITAR
      this.cargando.show();
      this.proveedorServicio.obtenerPorId(this.id).then((respuesta: any) => {
        console.log('RESPUESTA PARA EDITAR: ', respuesta);
        this.registroFormGroup = this.fb.group({
          locacion: [respuesta.locacion, [Validators.required]],
          empresa: [respuesta.empresa, [Validators.required, Validators.minLength(3)]],
          responsable: [respuesta.responsable, [Validators.required, Validators.minLength(3)]],
          email: [respuesta.email, [Validators.required, Validators.email]],
          telefono: [respuesta.telefono, [Validators.required]],
  
          descripcion: [respuesta.descripcion, [Validators.required]],

          fechaActualizacion: [this.fechaHoy]
        });

        this.cargando.hide();
      });
    }

  }

  // INICIAR
  ngOnInit() {
  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  // REGISTRAR
  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Se requerie datos...', 'OK', {
        duration: 3000
      });
      return;
    } else {
      if (this.data.nuevo) {
        this.cargando.show();
        this.proveedorServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, creado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(respuesta);
          this.cargando.hide();
        });
      } else {
        this.cargando.show();
        this.proveedorServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, actualizamos con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }
    }
  }
}
