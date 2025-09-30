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
import { OrdenService } from '../../../servicios/orden.service';

@Component({
  selector: 'app-orden-finalizar',
  templateUrl: './orden-finalizar.component.html',
  styleUrl: './orden-finalizar.component.scss',
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
export class OrdenFinalizarComponent {

  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  @ViewChild('aForm') aForm!: ElementRef;

  id: any;
  orden: any;
  usuario: any | null = null;
  idProgramacion: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<OrdenFinalizarComponent>,
    private fb: FormBuilder,
    private auth: AuthService,
    private vehiculoServicio: VehiculoService,
    private ordenServicio: OrdenService,
    private pServicio: ProgramacionService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private authServicio: AuthService,
  ) {
    this.id = data.id;
    this.orden = data.orden;
    this.idProgramacion = data.orden.programacionId;

    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        //console.log('USUARIO', user);

        const fechaNueva = this.fechaHoy.toISOString().split('T')[0];

        this.ordenServicio.obtenerPorId(data.id).then((respuesta: any) => {
          this.registroFormGroup = this.fb.group({

            programacionKilometraje: [respuesta.programacionKilometraje, [Validators.required]],
            programacionFrecuencia: [respuesta.programacionFrecuencia, [Validators.required]],


            kilometrajeActual: [respuesta.kilometrajeActual, [Validators.required]],
            kilometrajeProximo: [respuesta.kilometrajeProximo, [Validators.required]],

            fechaEntrada: [{ value: respuesta.fechaEntrada, disabled: true }, [Validators.required]],
            fechaSalida: [respuesta.fechaSalida, [Validators.required]],
            fechaProximo: [respuesta.fechaProximo, [Validators.required]],

            finalizadoObservacion: [null, [Validators.required]],
            finalizado: [true, [Validators.required]],

            finalizadoUsuario: [this.usuario.email],
            finalizadoFecha: [this.fechaHoy]
          });
          this.establecerSuscripcion();
          this.calcularProximo();
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
    this.r.fechaSalida.valueChanges.subscribe((val: any) => {
      this.calcularProximo();
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
      this.cargando.show();
      this.ordenServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {

        this.pServicio.editar(this.idProgramacion, {

          fechaUltimo: this.r.fechaEntrada.value,
          fechaProximo: this.r.fechaProximo.value,

          kilometrajeUltimo: this.r.kilometrajeActual.value,
          kilometrajeProximo: this.r.kilometrajeProximo.value,

          ordenId: null
        }).then(res => {
          this.snackbar.open('Hey!, Orden FINALIZADO con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(this.orden);
          this.cargando.hide();
        });

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

  calcularProximo() {
    const frecuencia = this.r.programacionFrecuencia.value; // p. ej. "MENSUAL"
    const fechaInicio = new Date(this.r.fechaSalida.value); // convertir a objeto Date

    let fechaProximo = new Date(fechaInicio); // clonamos la fecha

    switch (frecuencia) {
      case 'SEMANAL':
        fechaProximo.setDate(fechaProximo.getDate() + 7);
        break;
      case 'QUINSENAL':
        fechaProximo.setDate(fechaProximo.getDate() + 15);
        break;
      case 'MENSUAL':
        fechaProximo.setMonth(fechaProximo.getMonth() + 1);
        break;
      case 'BIMESTRAL':
        fechaProximo.setMonth(fechaProximo.getMonth() + 2);
        break;
      case 'TRIMESTRAL':
        fechaProximo.setMonth(fechaProximo.getMonth() + 3);
        break;
      case 'SEMESTRAL':
        fechaProximo.setMonth(fechaProximo.getMonth() + 6);
        break;
      case 'ANUAL':
        fechaProximo.setFullYear(fechaProximo.getFullYear() + 1);
        break;
      default:
        console.warn('Frecuencia no reconocida');
        break;
    }

    // Formatear a 'YYYY-MM-DD'
    const fechaProximoStr = fechaProximo.toISOString().split('T')[0];

    this.r.fechaProximo.setValue(fechaProximoStr);
  }
}
