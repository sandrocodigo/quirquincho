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

import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss'],
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
    MatSlideToggleModule
  ],
})
export class ClienteFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;

  id: any;

  fechaHoy = new Date();
  listaFormas = ['CONTADO', 'CREDITO'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ClienteFormComponent>,
    private fb: FormBuilder,
    private clienteServicio: ClienteService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
  ) {

    this.id = data.id;

    if (data.nuevo) {
      // FORM NUEVO

      this.registroFormGroup = this.fb.group({

        numero: [null, [Validators.required]],
        empresa: [null, [Validators.required, Validators.minLength(3)]],
        responsable: [null, [Validators.required, Validators.minLength(3)]],
        email: [null, [Validators.required, Validators.email]],
        telefono: [null, [Validators.required]],

        descripcion: [null],

        nit: [null],

        formaPago: ['CONTADO'],
        direccion: [null],
        activo: [true],

        usuarioEditorEmail: [],
        fechaRegistro: [this.fechaHoy]
      });
      this.obtenerUltimo();


    } else {
      // FORM EDITAR
      this.cargando.show();
      this.clienteServicio.obtenerPorId(this.id).then((respuesta: any) => {
        console.log('RESPUESTA PARA EDITAR: ', respuesta);
        this.registroFormGroup = this.fb.group({
          numero: [{ value: respuesta.numero, disabled: true }, [Validators.required]],
          empresa: [respuesta.empresa, [Validators.required, Validators.minLength(3)]],
          responsable: [respuesta.responsable, [Validators.required, Validators.minLength(3)]],
          email: [respuesta.email, [Validators.required, Validators.email]],
          telefono: [respuesta.telefono, [Validators.required]],

          descripcion: [respuesta.descripcion],
          nit: [respuesta.nit],

          formaPago: [respuesta.formaPago, [Validators.required]],
          direccion: [respuesta.direccion],
          activo: [respuesta.activo],

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

  obtenerUltimo() {
    if (this.data.nuevo) {
      this.clienteServicio.obtenerUltimo().then((res: any) => {
        console.log('ULTIMO: ', res);
        if (res) {
          const numeroNuevo = +res.numero + +1;
          this.r.numero.setValue(numeroNuevo);
        } else {
          this.r.numero.setValue(1);
        }
      });
    }
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
      if (this.data.nuevo) {
        this.cargando.show();
        this.clienteServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, creado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      } else {
        this.cargando.show();
        this.clienteServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, actualizamos con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }
    }
  }
}
