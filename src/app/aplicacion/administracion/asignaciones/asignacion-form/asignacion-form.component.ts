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

@Component({
  selector: 'app-asignacion-form',
  templateUrl: './asignacion-form.component.html',
  styleUrl: './asignacion-form.component.scss',
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
    NgSelectComponent,
  ],
})
export class AsignacionFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  @ViewChild('aForm') aForm!: ElementRef;

  id: any;
  registro: any;

  listaVehiculos: any = [];
  listaConductores: any = [];

  ordenExistente: any;

  listaMantenimientos: any = [];
  // listaDescripcion: any = [];

  listaFrecuencias = mantenimientoFrecuencias;
  listaKilometrajes = mantenimientoKilometrajes;

  listaTipos = documentoTipos;

  usuario: any | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AsignacionFormComponent>,
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
        //console.log('USUARIO', user);

        if (data.nuevo) {

          const fechaNueva = this.fechaHoy.toISOString().split('T')[0];

          this.registroFormGroup = this.fb.group({

            vehiculoId: [null, [Validators.required]],
            vehiculoNumero: [null, [Validators.required]],
            vehiculoPlaca: [null, [Validators.required]],
            vehiculoInterno: [null, [Validators.required]],
            vehiculoEmpresa: [null, [Validators.required]],

            conductorId: [null, [Validators.required]],
            conductorNombres: [null, [Validators.required]],
            conductorApellidos: [null, [Validators.required]],
            conductorLicenciaNumero: [null, [Validators.required]],


            descripcion: [null],
            contenido: [''],

            fechaInicio: [fechaNueva, [Validators.required]],
            fechaFinal: [null],

            kilometrajeInicio: [0, [Validators.required]],
            kilometrajeFinal: [0],

            finalizado: [false],
            activo: [true],
            registroUsuario: [this.usuario.email],
            registroFecha: [this.fechaHoy]
          });
          this.establecerSuscripcion();
          // this.obtenerUltimo();
        } else {
          // FORM EDITAR
          this.cargando.show();
          this.asignacionServicio.obtenerPorId(this.id).then((respuesta: any) => {

            this.registroFormGroup = this.fb.group({

              vehiculoId: [respuesta.vehiculoId, [Validators.required]],
              vehiculoNumero: [respuesta.vehiculoNumero, [Validators.required]],
              vehiculoPlaca: [respuesta.vehiculoPlaca, [Validators.required]],
              vehiculoInterno: [respuesta.vehiculoInterno, [Validators.required]],
              vehiculoEmpresa: [respuesta.vehiculoEmpresa, [Validators.required]],

              conductorId: [respuesta.conductorId, [Validators.required]],
              conductorNombres: [respuesta.conductorNombres, [Validators.required]],
              conductorApellidos: [respuesta.conductorApellidos, [Validators.required]],
              conductorLicenciaNumero: [respuesta.conductorLicenciaNumero, [Validators.required]],

              descripcion: [respuesta.descripcion],

              fechaInicio: [respuesta.fechaInicio, [Validators.required]],
              fechaFinal: [respuesta.fechaFinal],

              kilometrajeInicio: [respuesta.kilometrajeInicio, [Validators.required]],
              kilometrajeFinal: [respuesta.kilometrajeFinal],

              activo: [respuesta.activo],

              edicionUsuario: [this.usuario.email],
              edicionFecha: [this.fechaHoy]

            });
            // this.obtenerDescripciones();
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
    this.obtenerVehiculos();
    this.obtenerConductores();
    this.obtenerTipos();
  }

  obtenerTipos() {
    this.listaMantenimientos = mantenimientoTipos.map((res: any) => { res.dato = res.tipo + ' ' + res.descripcion; return res });
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

    this.r.vehiculoId.valueChanges.subscribe((val: any) => {
      this.obtenerDatosVehiculo();
    });

    this.r.conductorId.valueChanges.subscribe((val: any) => {
      this.obtenerDatosConductor();
    });

    /*     this.r.mantenimientoId.valueChanges.subscribe((val: any) => {
          this.obtenerDatosMantenimiento();
          this.actualizarFormulario();
        }); */

    /*     this.r.frecuencia.valueChanges.subscribe((val: any) => {
          this.calcularProximo();
        });
    
        this.r.fechaInicio.valueChanges.subscribe((val: any) => {
          this.calcularProximo();
        });
     */
    /*     this.r.kilometraje.valueChanges.subscribe((val: any) => {
          this.calcularProximoKilometraje();
        });
    
        this.r.kilometrajeInicio.valueChanges.subscribe((val: any) => {
          this.calcularProximoKilometraje();
        }); */

  }

  obtenerVehiculos(): void {
    this.vehiculoServicio.obtenerTodosActivos().then(res => {
      this.listaVehiculos = res.map((res: any) => { res.dato = res.interno + ' - ' + res.placa; return res });
    });
  }

  obtenerConductores(): void {
    this.conductorServicio.obtenerTodosActivos().then(res => {
      this.listaConductores = res.map((res: any) => { res.dato = res.apellidos + ' ' + res.nombres; return res });
    });
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

  // Validador personalizado para litros mayores a 0
  validarLitrosMayorQueCero(control: AbstractControl) {
    const valor = control.value;
    if (valor !== null && valor <= 0) {
      return { litrosInvalido: true };  // Devuelve un error si el valor no es válido
    }
    return null;  // No hay errores si es válido
  }

  /*   verificar() {
      if (this.data.nuevo) {
        this.ordenServicio.obtenerParaVerificar(this.r.empresa.value, this.r.placa.value).then((res: any) => {
          console.log('VERIFICACION: ', res);
          if (res) {
            this.ordenExistente = res;
          } else {
            this.ordenExistente = null;
          }
        });
      }
    } */

  obtenerDatosVehiculo() {
    const idVehiculo = this.r.vehiculoId.value; // Obtener el ID del cliente desde el formulario

    // Buscar el cliente en la lista de clientes usando 'find'
    const vehiculoEncontrado = this.listaVehiculos.find((vehiculo: any) => vehiculo.id === idVehiculo);

    console.log('ENCONTRADO: ', vehiculoEncontrado)
    // Si se encuentra el cliente, llenar los valores en el formulario
    if (vehiculoEncontrado) {
      this.r.vehiculoNumero.setValue(vehiculoEncontrado.numero);
      this.r.vehiculoPlaca.setValue(vehiculoEncontrado.placa);
      this.r.vehiculoInterno.setValue(vehiculoEncontrado.interno);
      this.r.vehiculoEmpresa.setValue(vehiculoEncontrado.empresa);

    } else {
      // Si no se encuentra el cliente, puedes manejar el caso (mostrar un mensaje, limpiar los campos, etc.)
      this.r.vehiculoNumero.setValue('');
      this.r.vehiculoPlaca.setValue('');
      this.r.vehiculoInterno.setValue('');
      this.r.vehiculoEmpresa.setValue('');

      console.log('no encontrado');
    }
  }

  obtenerDatosConductor() {
    const idConductor = this.r.conductorId.value; // Obtener el ID del cliente desde el formulario
    const conductorEncontrado = this.listaConductores.find((conductor: any) => conductor.id === idConductor);

    // Si se encuentra el cliente, llenar los valores en el formulario
    if (conductorEncontrado) {
      this.r.conductorNombres.setValue(conductorEncontrado.nombres);
      this.r.conductorApellidos.setValue(conductorEncontrado.apellidos);
      this.r.conductorLicenciaNumero.setValue(conductorEncontrado.licenciaNumero);
    } else {
      this.r.conductorNombres.setValue('');
      this.r.conductorApellidos.setValue('');
      this.r.conductorLicenciaNumero.setValue('');

      console.log('no encontrado');
    }
  }

}
