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
import { DocumentoService } from '../../../servicios/documento.service';
import { documentoTipos } from '../../../datos/documento-tipos';


@Component({
  selector: 'app-documento-form',
  templateUrl: './documento-form.component.html',
  styleUrl: './documento-form.component.scss',
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
export class DocumentoFormComponent {
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

  listaTipos = documentoTipos;

  usuario: any | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DocumentoFormComponent>,
    private fb: FormBuilder,
    private auth: AuthService,
    private vehiculoServicio: VehiculoService,
    private dServicio: DocumentoService,
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


            documentoTipo: [null, [Validators.required]],

            documentoNumero: [null],
            descripcion: [null],

            frecuencia: [null, [Validators.required]],
            fechaInicio: [fechaNueva, [Validators.required]],
            fechaProximo: [null, [Validators.required]],


            activo: [true],

            registroUsuario: [this.usuario.email],
            registroFecha: [this.fechaHoy]
          });
          this.establecerSuscripcion();
          // this.obtenerUltimo();
        } else {
          // FORM EDITAR
          this.cargando.show();
          this.dServicio.obtenerPorId(this.id).then((respuesta: any) => {

            this.registroFormGroup = this.fb.group({

              vehiculoId: [respuesta.vehiculoId, [Validators.required]],
              vehiculoNumero: [respuesta.vehiculoNumero, [Validators.required]],
              vehiculoPlaca: [respuesta.vehiculoPlaca, [Validators.required]],
              vehiculoInterno: [respuesta.vehiculoInterno, [Validators.required]],

              documentoTipo: [respuesta.documentoTipo, [Validators.required]],

              documentoNumero: [respuesta.documentoNumero],
              descripcion: [respuesta.descripcion],

              frecuencia: [respuesta.frecuencia, [Validators.required]],
              fechaInicio: [respuesta.fechaInicio, [Validators.required]],
              fechaProximo: [respuesta.fechaProximo, [Validators.required]],

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
      this.dServicio.obtenerUltimo(this.usuario.empresa).then((res: any) => {
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

    /*     this.r.mantenimientoId.valueChanges.subscribe((val: any) => {
          this.obtenerDatosMantenimiento();
          this.actualizarFormulario();
        }); */

    this.r.frecuencia.valueChanges.subscribe((val: any) => {
      this.calcularProximo();
    });

    this.r.fechaInicio.valueChanges.subscribe((val: any) => {
      this.calcularProximo();
    });

    /*     this.r.kilometraje.valueChanges.subscribe((val: any) => {
          this.calcularProximoKilometraje();
        });
    
        this.r.kilometrajeInicio.valueChanges.subscribe((val: any) => {
          this.calcularProximoKilometraje();
        }); */

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
      // Marca todos los campos como tocados para que se muestren los errores visuales
      this.registroFormGroup.markAllAsTouched();

      // Recolectar los nombres de los campos inválidos
      const camposInvalidos = Object.keys(this.r).filter(key => this.r[key].invalid);

      console.warn('Campos inválidos:', camposInvalidos); // Debug en consola

      // Opcional: mostrar en snackbar
      this.snackbar.open(`Faltan datos en: ${camposInvalidos.join(', ')}`, 'OK', {
        duration: 5000
      });

      return;
    } else {
      if (this.data.nuevo) {
        this.cargando.show();
        this.dServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Programacion creado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      } else {
        this.cargando.show();
        this.dServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
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
      this.r.mantenimientoTipo.setValue(mantenimientoEncontrado.tipo);
      this.r.mantenimientoDescripcion.setValue(mantenimientoEncontrado.descripcion);
      this.r.mantenimientoFrecuencia.setValue(mantenimientoEncontrado.frecuencia);
      this.r.mantenimientoKilometraje.setValue(mantenimientoEncontrado.kilometraje);
    } else {
      // Si no se encuentra
      this.r.mantenimientoTipo.setValue('');
      this.r.mantenimientoDescripcion.setValue('');
      this.r.mantenimientoFrecuencia.setValue('');
      this.r.mantenimientoKilometraje.setValue('');

      console.log('NO ENCONTRADO');
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
      case 'SEMANAL': fechaProximo.setDate(fechaProximo.getDate() + 7); break;
      case 'QUINSENAL': fechaProximo.setDate(fechaProximo.getDate() + 15); break;
      case 'MENSUAL': fechaProximo.setMonth(fechaProximo.getMonth() + 1); break;
      case 'BIMESTRAL': fechaProximo.setMonth(fechaProximo.getMonth() + 2); break;
      case 'TRIMESTRAL': fechaProximo.setMonth(fechaProximo.getMonth() + 3); break;
      case 'SEMESTRAL': fechaProximo.setMonth(fechaProximo.getMonth() + 6); break;
      case 'ANUAL': fechaProximo.setFullYear(fechaProximo.getFullYear() + 1); break;
      case '2 AÑOS': fechaProximo.setFullYear(fechaProximo.getFullYear() + 2); break;

      case '3 AÑOS': fechaProximo.setFullYear(fechaProximo.getFullYear() + 3); break;
      case '4 AÑOS': fechaProximo.setFullYear(fechaProximo.getFullYear() + 4); break;
      case '5 AÑOS': fechaProximo.setFullYear(fechaProximo.getFullYear() + 5); break;
      case '6 AÑOS': fechaProximo.setFullYear(fechaProximo.getFullYear() + 6); break;
      case '7 AÑOS': fechaProximo.setFullYear(fechaProximo.getFullYear() + 7); break;
      case '8 AÑOS': fechaProximo.setFullYear(fechaProximo.getFullYear() + 8); break;
      case '9 AÑOS': fechaProximo.setFullYear(fechaProximo.getFullYear() + 9); break;
      case '10 AÑOS': fechaProximo.setFullYear(fechaProximo.getFullYear() + 10); break;

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
