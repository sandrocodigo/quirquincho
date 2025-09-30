import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { NgSelectComponent } from '@ng-select/ng-select';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AuthService } from '../../../servicios/auth.service';
import { VehiculoService } from '../../../servicios/vehiculo.service';
import { mantenimientoTipos } from '../../../datos/mantenimiento-tipos';
import { mantenimientoFrecuencias } from '../../../datos/mantenimiento-frecuencias';
import { mantenimientoKilometrajes } from '../../../datos/mantenimiento-kilometrajes';
import { documentoTipos } from '../../../datos/documento-tipos';
import { ConductorService } from '../../../servicios/conductor.service';
import { AsignacionService } from '../../../servicios/asignacion.service';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-asignacion-contenido',
  templateUrl: './asignacion-contenido.component.html',
  styleUrl: './asignacion-contenido.component.scss',
  standalone: true,
  imports: [
    CommonModule,
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
    MatSlideToggleModule,

    // QUILL
    QuillModule
  ],
})
export class AsignacionContenidoComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  @ViewChild('aForm') aForm!: ElementRef;

  id: any;
  registro: any;

  usuario: any | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AsignacionContenidoComponent>,
    private fb: FormBuilder,
    private auth: AuthService,
    private vehiculoServicio: VehiculoService,
    private conductorServicio: ConductorService,
    private asignacionServicio: AsignacionService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private authServicio: AuthService,
  ) {
    this.id = data.id;
    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;

        // FORM EDITAR
        this.cargando.show();
        this.asignacionServicio.obtenerPorId(this.id).then((respuesta: any) => {

          this.registroFormGroup = this.fb.group({


            contenido: [respuesta.contenido, [Validators.required]],

            contenidoUsuario: [this.usuario.email],
            contenidoFecha: [this.fechaHoy]

          });
          // this.obtenerDescripciones();
          // this.establecerSuscripcion();
          this.cargando.hide();
          // this.focus();
        });

      }
    });

  }

  // INICIAR
  ngOnInit() {

  }


  // FOCUS
  focus(): void {
    setTimeout(() => {
      const input = 'precio';
      const ele = this.aForm.nativeElement[input];
      if (ele) {
        ele.focus();
        ele.select();
      }
    }, 100);
  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {

    /*    this.r.vehiculoId.valueChanges.subscribe((val: any) => {
          this.obtenerDatosVehiculo();
        }); */


  }

  // REGISTRAR
  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      // Marca todos los campos como tocados para que se muestren los errores visuales
      this.registroFormGroup.markAllAsTouched();

      // Recolectar los nombres de los campos inválidos
      const camposInvalidos = Object.keys(this.r).filter(key => this.r[key].invalid);

      console.warn('Campos inválidos:', camposInvalidos); // Debug en consola

      // Opcional: mostrar en snackbar
      this.snackbar.open(`Faltan datos en: ${camposInvalidos.join(', ')}`, 'OK', { duration: 5000 });

      return;
    } else {
      if (this.data.nuevo) {
        this.cargando.show();
        this.asignacionServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Programacion creado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      } else {
        this.cargando.show();
        this.asignacionServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Orden actualizado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }

    }
  }

}
