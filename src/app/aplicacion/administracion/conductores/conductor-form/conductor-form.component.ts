import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
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


import { AuthService } from '../../../servicios/auth.service';
import { VehiculoService } from '../../../servicios/vehiculo.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UsuarioService } from '../../../servicios/usuario.service';
import { vehiculoMarcas } from '../../../datos/vehiculo-marca';
import { vehiculoModelos } from '../../../datos/vehiculo-modelos';
import { vehiculoCarrocerias } from '../../../datos/vehiculo-carrocerias';
import { vehiculoTipos } from '../../../datos/vehiculo-tipos';
import { vehiculoEjes } from '../../../datos/vehiculo-ejes';
import { ConductorService } from '../../../servicios/conductor.service';


@Component({
  selector: 'app-conductor-form',
  templateUrl: './conductor-form.component.html',
  styleUrl: './conductor-form.component.scss',
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

  ],
})
export class ConductorFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  @ViewChild('aForm') aForm!: ElementRef;

  listaCategorias = ['A', 'B', 'C', 'T', 'M']

  id: any;
  registro: any;

  usuario: any | null = null;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConductorFormComponent>,
    private fb: FormBuilder,
    private auth: AuthService,
    private conductorServicio: ConductorService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private usuarioServicio: UsuarioService,
    private authServicio: AuthService,
  ) {
    this.id = data.id;
    this.usuario = data.usuario;

    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        if (data.nuevo) {

          this.registroFormGroup = this.fb.group({

            nombres: [null, [Validators.required]],
            apellidos: [null, [Validators.required]],

            licenciaNumero: [null, [Validators.required]],
            licenciaCategoria: [null, [Validators.required]],

            activo: [true],
            registroUsuario: [this.usuario.email],
            registroFecha: [this.fechaHoy],

          });
          this.establecerSuscripcion();

        } else {
          // FORM EDITAR
          this.cargando.show();
          this.conductorServicio.obtenerPorId(this.id).then((respuesta: any) => {

            this.registroFormGroup = this.fb.group({

              nombres: [respuesta.nombres, [Validators.required]],
              apellidos: [respuesta.apellidos, [Validators.required]],

              licenciaNumero: [respuesta.licenciaNumero, [Validators.required]],
              licenciaCategoria: [respuesta.licenciaCategoria, [Validators.required]],

              activo: [respuesta.activo],

              edicionUsuario: [this.usuario.email],
              edicionFecha: [this.fechaHoy]
            });

            this.establecerSuscripcion();
            this.cargando.hide();
            // this.focus();
          });
        }
      }
    });

  }

  // INICIAR
  ngOnInit() {
  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    /*     this.r.producto.valueChanges.subscribe((val: any) => {
          this.focus();
        });
    */
  }

  // REGISTRAR
  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Oyeeeeee, Se requerie datos...', 'OK', {
        duration: 3000
      });
      return;
    } else {
      if (this.data.nuevo) {
        this.cargando.show();
        this.conductorServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Vehiculo creado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      } else {
        this.cargando.show();
        this.conductorServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Vehiculo actualizado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }

    }
  }
}
