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
import { TarifaService } from '../../../servicios/tarifa.service';



@Component({
  selector: 'app-tarifa-form',
  templateUrl: './tarifa-form.component.html',
  styleUrl: './tarifa-form.component.scss',
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
export class TarifaFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  @ViewChild('aForm') aForm!: ElementRef;

  id: any;
  registro: any;

  usuario: any;

  usuarios: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TarifaFormComponent>,
    private fb: FormBuilder,
    private auth: AuthService,
    private tarifaServicio: TarifaService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private usuarioServicio: UsuarioService,
  ) {
    this.id = data.id;
    this.usuario = data.usuario;

    if (data.nuevo) {

      this.registroFormGroup = this.fb.group({


        origen: [null, [Validators.required]],
        destino: [null, [Validators.required]],

        precio1: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
        precio2: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
        precio3: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
        precio4: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
        precio5: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],

        activo: [true],

        usuarioRegistro: [this.usuario.email],
        fechaRegistro: [this.fechaHoy]
      });
      this.establecerSuscripcion();

    } else {
      // FORM EDITAR
      this.cargando.show();
      this.tarifaServicio.obtenerPorId(this.id).then((respuesta: any) => {

        this.registroFormGroup = this.fb.group({

          origen: [respuesta.origen, [Validators.required]],
          destino: [respuesta.destino, [Validators.required]],

          precio1: [respuesta.precio1, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
          precio2: [respuesta.precio2, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
          precio3: [respuesta.precio3, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
          precio4: [respuesta.precio4, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
          precio5: [respuesta.precio5, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],

          activo: [respuesta.activo],

          usuarioEditor: [this.usuario.email],
          fechaActualizacion: [this.fechaHoy]
        });

        this.establecerSuscripcion();
        this.cargando.hide();
        // this.focus();
      });
    }

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
    /*     this.r.producto.valueChanges.subscribe((val: any) => {
          this.focus();
        });
    
        this.r.fechaInicio.valueChanges.subscribe((val: any) => {
          this.fechasFinal = this.obtenerFechasFinal();
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
      if (this.data.nuevo) {
        this.cargando.show();
        this.tarifaServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Vehiculo creado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      } else {
        this.cargando.show();
        this.tarifaServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Vehiculo actualizado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }

    }
  }
}
