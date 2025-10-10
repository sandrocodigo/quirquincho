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
  selector: 'app-programacion-orden',
  templateUrl: './programacion-orden.component.html',
  styleUrl: './programacion-orden.component.scss',
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
export class ProgramacionOrdenComponent {
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

  idPrograma: any;
  programacion: any;

  listaSucursales = sucursales;
  listaOrdenes: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProgramacionOrdenComponent>,
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
    this.idPrograma = data.id;
    this.programacion = data.programacion;

    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        //console.log('USUARIO', user);

        const fechaNueva = this.fechaHoy.toISOString().split('T')[0];

        this.ordenServicio.obtenerUltimoMuchos(this.programacion.vehiculoId).then(resOrden => {

          this.listaOrdenes = resOrden;
          console.log('ORDENES NO FINALIZADOS: ', this.listaOrdenes);

          const codigoOrden = resOrden.length > 0 ? resOrden[0].codigo : 'nuevo';

          const ordenSucursal = resOrden.length > 0 ? resOrden[0].sucursal : null;
          const ordenTaller = resOrden.length > 0 ? resOrden[0].taller : 'GALPON';
          const ordenKA = resOrden.length > 0 ? resOrden[0].kilometrajeActual : this.programacion.kilometrajeProximo;
          const ordenFechaEntrada = resOrden.length > 0 ? resOrden[0].fechaEntrada : fechaNueva;
          const ordenFechaSalida = resOrden.length > 0 ? resOrden[0].fechaSalida : fechaNueva;

          console.log('ULTIMA ORDEN: ', codigoOrden);

          this.registroFormGroup = this.fb.group({

            codigo: [codigoOrden, [Validators.required]],

            sucursal: [ordenSucursal, [Validators.required]],
            taller: [ordenTaller],

            programacionId: [this.programacion.id],

            vehiculoId: [{ value: this.programacion.vehiculoId, disabled: true }, [Validators.required]],
            vehiculoNumero: [this.programacion.vehiculoNumero, [Validators.required]],
            vehiculoPlaca: [this.programacion.vehiculoPlaca, [Validators.required]],
            vehiculoInterno: [this.programacion.vehiculoInterno, [Validators.required]],
            vehiculoEmpresa: [this.programacion.vehiculoEmpresa, [Validators.required]],

            mantenimientoId: [{ value: this.programacion.mantenimientoId, disabled: true }, [Validators.required]],
            mantenimientoTipo: [this.programacion.mantenimientoTipo, [Validators.required]],
            mantenimientoDescripcion: [this.programacion.mantenimientoDescripcion, [Validators.required]],
            mantenimientoFrecuencia: [this.programacion.mantenimientoFrecuencia, [Validators.required]],
            mantenimientoKilometraje: [this.programacion.mantenimientoKilometraje, [Validators.required]],

            programacionKilometraje: [this.programacion.kilometraje, [Validators.required]],
            programacionKilometrajeInicio: [this.programacion.kilometrajeInicio, [Validators.required]],
            programacionKilometrajeProximo: [this.programacion.kilometrajeProximo, [Validators.required]],

            programacionFrecuencia: [this.programacion.frecuencia, [Validators.required]],
            programacionFechaInicio: [this.programacion.fechaInicio, [Validators.required]],
            programacionFechaProximo: [this.programacion.fechaProximo, [Validators.required]],

            kilometrajeActual: [ordenKA, [Validators.required]],
            kilometrajeProximo: [0, [Validators.required]],

            fechaEntrada: [ordenFechaEntrada, [Validators.required]],
            fechaSalida: [ordenFechaSalida, [Validators.required]],

            causa: [this.programacion.mantenimientoDescripcion, [Validators.required]],
            respuestos: [null],
            observaciones: [null],

            finalizado: [false],
            activo: [true],

            registroUsuario: [this.usuario.email],
            registroFecha: [this.fechaHoy]
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
      this.ordenServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
        console.log('RESPUESTA ORDEN: ', respuesta.id);
        this.dialogRef.close();
        this.pServicio.editar(this.idPrograma, { ordenId: respuesta.id }).then(res => {
          this.snackbar.open('Hey!, Orden creado con exito...', 'OK', { duration: 10000 });
          this.cargando.hide();
          this.router.navigate(['/administracion/ordenes/detalle/' + respuesta.id]);
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
}
