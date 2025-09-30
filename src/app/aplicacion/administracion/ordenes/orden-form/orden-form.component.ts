import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

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
import { ProgramacionService } from '../../../servicios/programacion.service';
import { mantenimientoFrecuencias } from '../../../datos/mantenimiento-frecuencias';
import { mantenimientoKilometrajes } from '../../../datos/mantenimiento-kilometrajes';
import { OrdenService } from '../../../servicios/orden.service';
import { sucursales } from '../../../datos/sucursales';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orden-form',
  templateUrl: './orden-form.component.html',
  styleUrl: './orden-form.component.scss',
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
export class OrdenFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  @ViewChild('aForm') aForm!: ElementRef;

  id: any;
  registro: any;

  listaVehiculos: any = [];

  ordenExistente: any;

  listaMantenimientos: any = [];
  // listaDescripcion: any = [];

  listaFrecuencias = mantenimientoFrecuencias;
  listaKilometrajes = mantenimientoKilometrajes;

  usuario: any | null = null;

  idOrden: any;
  listaSucursales = sucursales;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<OrdenFormComponent>,
    private fb: FormBuilder,
    private auth: AuthService,
    private vehiculoServicio: VehiculoService,
    private ordenServicio: OrdenService,
    private pServicio: ProgramacionService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    public router: Router,
  ) {
    this.idOrden = data.id;
    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        //console.log('USUARIO', user);

        const fechaNueva = this.fechaHoy.toISOString().split('T')[0];

        this.ordenServicio.obtenerPorId(this.idOrden).then(resOrden => {

          this.registroFormGroup = this.fb.group({

            sucursal: [resOrden?.sucursal, [Validators.required]],
            taller: [resOrden?.taller],

            kilometrajeActual: [resOrden?.kilometrajeActual, [Validators.required]],
            kilometrajeProximo: [resOrden?.kilometrajeProximo, [Validators.required]],

            fechaEntrada: [resOrden?.fechaEntrada, [Validators.required]],
            fechaSalida: [resOrden?.fechaSalida, [Validators.required]],

            causa: [resOrden?.causa, [Validators.required]],
            observaciones: [resOrden?.observaciones],



            edicionUsuario: [this.usuario.email],
            edicionFecha: [this.fechaHoy]
          });
          // this.sumarKilometros();
          this.establecerSuscripcion();

        });


        // this.obtenerUltimo();

      }
    });

  }

  // INICIAR
  ngOnInit() {

  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    this.r.kilometrajeActual.valueChanges.subscribe((val: any) => {
      this.sumarKilometros();
    });
    /* 
        this.r.fechaInicio.valueChanges.subscribe((val: any) => {
          this.calcularProximo();
        });
    
        this.r.kilometraje.valueChanges.subscribe((val: any) => {
          this.calcularProximoKilometraje();
        });
    
        this.r.kilometrajeInicio.valueChanges.subscribe((val: any) => {
          this.calcularProximoKilometraje();
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
      this.cargando.show();
      this.ordenServicio.editar(this.idOrden, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
        // console.log('RESPUESTA ORDEN: ', respuesta.id);
        this.dialogRef.close(true);
        this.cargando.hide();
      });
    }
  }

  // Validador personalizado para litros mayores a 0
  validarLitrosMayorQueCero(control: AbstractControl) {
    const valor = control.value;
    if (valor !== null && valor <= 0) {
      return { litrosInvalido: true };  // Devuelve un error si el valor no es válido
    }
    return null;  // No hay errores si es válido
  }

  actualizarFormulario() {
    // BLOQUEAR Y DESBLOQUEAR SEGUN TIPO DE MANTENIMIENTO
  }

  sumarKilometros() {
    const actual = this.r.kilometrajeActual.value;
    const km = this.r.programacionKilometraje.value;
    const proximo = +actual + +km;
    this.r.kilometrajeProximo.setValue(proximo);
    // BLOQUEAR Y DESBLOQUEAR SEGUN TIPO DE MANTENIMIENTO
  }
}
