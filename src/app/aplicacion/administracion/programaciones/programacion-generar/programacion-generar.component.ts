import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';

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
import { mantenimientoTipos } from '../../../datos/mantenimiento-tipos';
import { mantenimientoFrecuencias } from '../../../datos/mantenimiento-frecuencias';
import { mantenimientoKilometrajes } from '../../../datos/mantenimiento-kilometrajes';
import { OrdenService } from '../../../servicios/orden.service';
@Component({
  selector: 'app-programacion-generar',
  templateUrl: './programacion-generar.component.html',
  styleUrl: './programacion-generar.component.scss',
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
export class ProgramacionGenerarComponent {
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProgramacionGenerarComponent>,
    private fb: FormBuilder,
    private auth: AuthService,
    private vehiculoServicio: VehiculoService,
    private ordenServicio: OrdenService,
    private pServicio: ProgramacionService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private authServicio: AuthService,
  ) {
    this.idPrograma = data.id;
    this.programacion = data.programacion;
    console.log('PROGRAMACION: ', this.programacion);

    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        //console.log('USUARIO', user);

        const fechaNueva = this.fechaHoy.toISOString().split('T')[0];

        this.registroFormGroup = this.fb.group({

          vehiculoId: [{ value: this.programacion.vehiculoId, disabled: true }, [Validators.required]],
          vehiculoNumero: [this.programacion.vehiculoNumero, [Validators.required]],
          vehiculoPlaca: [this.programacion.vehiculoPlaca, [Validators.required]],
          vehiculoInterno: [this.programacion.vehiculoInterno, [Validators.required]],

          mantenimientoId: [null, [Validators.required]],
          mantemimientoTipo: [null, [Validators.required]],
          mantenimientoDescripcion: [null, [Validators.required]],
          mantenimientoFrecuencia: [null, [Validators.required]],
          mantenimientoKilometraje: [null, [Validators.required]],

          kilometraje: [5000, [Validators.required]],
          kilometrajeInicio: [0, [Validators.required]],
          kilometrajeProximo: [0, [Validators.required]],

          frecuencia: [null, [Validators.required]],
          fechaInicio: [fechaNueva, [Validators.required]],
          fechaProximo: [null, [Validators.required]],

          activo: [true],

          registroUsuario: [this.usuario.email],
          registroFecha: [this.fechaHoy]
        });
        this.establecerSuscripcion();
        // this.obtenerUltimo();

      }
    });

  }

  // INICIAR
  ngOnInit() {
    this.obtenerVehiculos();
    this.obtenerTipos();
  }

  obtenerTipos() {
    this.listaMantenimientos = mantenimientoTipos.map((res: any) => { res.dato = res.tipo + ' - ' + res.descripcion; return res });
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

  obtenerUltimo() {
    if (this.data.nuevo) {
      this.pServicio.obtenerUltimo(this.usuario.empresa).then((res: any) => {
        console.log('ULTIMO: ', res);
        if (res) {
          const ordenNuevo = +res.orden + +1;
          this.r.orden.setValue(ordenNuevo);
        } else {
          this.r.orden.setValue(1);
        }
      });
    }
  }

  establecerSuscripcion() {

    this.r.vehiculoId.valueChanges.subscribe((val: any) => {
      this.obtenerDatosVehiculo();
    });

    this.r.mantenimientoId.valueChanges.subscribe((val: any) => {
      this.obtenerDatosMantenimiento();
      this.actualizarFormulario();
    });

    this.r.frecuencia.valueChanges.subscribe((val: any) => {
      this.calcularProximo();
    });

    this.r.fechaInicio.valueChanges.subscribe((val: any) => {
      this.calcularProximo();
    });

    this.r.kilometraje.valueChanges.subscribe((val: any) => {
      this.calcularProximoKilometraje();
    });

    this.r.kilometrajeInicio.valueChanges.subscribe((val: any) => {
      this.calcularProximoKilometraje();
    });

  }

  obtenerVehiculos(): void {
    this.cargando.show();
    this.vehiculoServicio.obtenerTodosActivos().then(res => {
      this.listaVehiculos = res.map((res: any) => { res.dato = res.interno + ' - ' + res.placa; return res });
      // this.listaVehiculos = res;
      // console.log('VEHICULOS', res);
      this.cargando.hide();
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
      if (this.data.nuevo) {
        this.cargando.show();
        this.pServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Programacion creado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      } else {
        this.cargando.show();
        this.pServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
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

    } else {
      // Si no se encuentra el cliente, puedes manejar el caso (mostrar un mensaje, limpiar los campos, etc.)
      this.r.vehiculoNumero.setValue('');
      this.r.vehiculoPlaca.setValue('');
      this.r.vehiculoInterno.setValue('');

      console.log('no encontrado');
    }
  }

  obtenerDatosMantenimiento() {
    const idMantenimiento = this.r.mantenimientoId.value;

    // Buscar 
    const mantenimientoEncontrado = this.listaMantenimientos.find((tipo: any) => tipo.id === idMantenimiento);

    console.log('ENCONTRADO: ', mantenimientoEncontrado)
    // Si se encuentra
    if (mantenimientoEncontrado) {
      this.r.mantemimientoTipo.setValue(mantenimientoEncontrado.tipo);
      this.r.mantenimientoDescripcion.setValue(mantenimientoEncontrado.descripcion);
      this.r.mantenimientoFrecuencia.setValue(mantenimientoEncontrado.frecuencia);
      this.r.mantenimientoKilometraje.setValue(mantenimientoEncontrado.kilometraje);
    } else {
      // Si no se encuentra
      this.r.mantemimientoTipo.setValue('');
      this.r.mantenimientoDescripcion.setValue('');
      this.r.mantenimientoFrecuencia.setValue('');
      this.r.mantenimientoKilometraje.setValue('');

      console.log('no encontrado');
    }
  }

  obtenerDescripciones() {
    const tipo = this.r.mantenimientoTipo.value;
    const encontrado = mantenimientoTipos.find(item => item.id === tipo);
    //this.listaDescripcion = encontrado ? encontrado.lista : [];
  }

  calcularProximo() {
    const frecuencia = this.r.frecuencia.value; // p. ej. "MENSUAL"
    const fechaInicio = new Date(this.r.fechaInicio.value); // convertir a objeto Date

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

  calcularProximoKilometraje() {
    console.log('LLEGO A CALCULAR');
    const kilometraje = this.r.kilometraje.value || 0;
    const kilometrajeInicio = this.r.kilometrajeInicio.value || 0;
    const kilometrajeProximo = +kilometraje + +kilometrajeInicio;
    this.r.kilometrajeProximo.setValue(kilometrajeProximo);
  }

  actualizarFormulario() {
    // BLOQUEAR Y DESBLOQUEAR SEGUN TIPO DE MANTENIMIENTO
  }
}
