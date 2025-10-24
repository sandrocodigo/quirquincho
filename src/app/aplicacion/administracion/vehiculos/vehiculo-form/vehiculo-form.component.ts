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
import { vehiculoEmpresas } from '../../../datos/vehiculo-empresas';

@Component({
  selector: 'app-vehiculo-form',
  templateUrl: './vehiculo-form.component.html',
  styleUrls: ['./vehiculo-form.component.scss'],
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
export class VehiculoFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  @ViewChild('aForm') aForm!: ElementRef;

  id: any;
  registro: any;

  usuario: any;

  usuarios: any;

  listaTipos = vehiculoTipos;
  listaMarcas = vehiculoMarcas;
  listaModelos = vehiculoModelos;
  listaEmpresas = vehiculoEmpresas;
  listaCarrocerias = vehiculoCarrocerias;
  listaEjes = vehiculoEjes;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<VehiculoFormComponent>,
    private fb: FormBuilder,
    private auth: AuthService,
    private vehiculoServicio: VehiculoService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private usuarioServicio: UsuarioService,
  ) {
    this.id = data.id;
    this.usuario = data.usuario;

    if (data.nuevo) {

      this.registroFormGroup = this.fb.group({

        numero: [null, [Validators.required]],
        placa: [null, [Validators.required]],
        interno: [null, [Validators.required]],

        gestion: [null, [Validators.required]],

        empresa: [null, [Validators.required]],

        tipo: [null, [Validators.required]],
        marca: [null, [Validators.required]],
        // modelo: [null, [Validators.required]],
        carroceria: [null, [Validators.required]],

        chasis: [null, [Validators.required]],
        motor: [null, [Validators.required]],
        ejes: [null, [Validators.required]],
        butacas: [null, [Validators.required]],

        /*
        conductor: [null, [Validators.required]],
        conductorLicencia: [null],
        conductorTelefono: ['591'],
        conductorEmail: [null], 
        */

        activo: [true],
        usuarioRegistro: [this.usuario.email],
        fechaRegistro: [this.fechaHoy]
      });
      this.establecerSuscripcion();
      this.obtenerUltimo();
      this.obtenerUsuariosLibres();


    } else {
      // FORM EDITAR
      this.cargando.show();
      this.vehiculoServicio.obtenerPorId(this.id).then((respuesta: any) => {

        this.registroFormGroup = this.fb.group({
          numero: [{ value: respuesta.numero, disabled: false }, [Validators.required]],


          placa: [respuesta.placa, [Validators.required]],
          interno: [respuesta.interno, [Validators.required]],
  
          gestion: [respuesta.gestion],
          empresa: [respuesta.empresa, [Validators.required]],
  
          tipo: [respuesta.tipo, [Validators.required]],
          marca: [respuesta.marca, [Validators.required]],
          // modelo: [respuesta.modelo, [Validators.required]],
          carroceria: [respuesta.carroceria, [Validators.required]],
  
          chasis: [respuesta.chasis, [Validators.required]],
          motor: [respuesta.motor, [Validators.required]],
          ejes: [respuesta.ejes, [Validators.required]],
          butacas: [respuesta.butacas, [Validators.required]],

          activo: [respuesta.activo],
          usuarioEditor: [this.usuario.email],
          fechaActualizacion: [this.fechaHoy]
        });

        this.establecerSuscripcion();
        this.obtenerUsuarios();
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

  obtenerUltimo() {
    if (this.data.nuevo) {
      this.vehiculoServicio.obtenerUltimo().then((res: any) => {
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

  obtenerUsuarios(): void {
    this.usuarioServicio.obtenerConsultaPorTipo({ adminTipo: 'conductor', }).then((respuesta: any) => {
      this.usuarios = respuesta;
    }).catch((err) => {
      console.error('Error obteniendo usuarios: ', err);
      //this.cargando.hide();
    });
  }

  obtenerUsuariosLibres(): void {
    this.cargando.show();
    this.usuarioServicio.obtenerConsultaPorTipo({ adminTipo: 'conductor', }).then((respuesta: any) => {
      console.log('USUARIOS CONDUCTOR: ', respuesta);

      // Obtener los vehículos con conductor asignado
      this.vehiculoServicio.obtenerConsulta({ activo: 'true', limite: 100 }).then((res: any) => {
        console.log('VEHICULOS: ', res);

        // Obtener los correos electrónicos de los conductores asignados a vehículos
        const conductoresAsignados = res.map((vehiculo: any) => vehiculo.conductorEmail);

        // Filtrar usuarios cuyo correo NO esté en la lista de conductores asignados
        const usuariosNoAsignados = respuesta.filter((usuario: any) => !conductoresAsignados.includes(usuario.email));

        // Asignar la lista de usuarios no asignados a la variable que mostrarás
        this.usuarios = usuariosNoAsignados;

        this.cargando.hide();
      }).catch((err) => {
        console.error('Error obteniendo vehículos: ', err);
        this.cargando.hide();
      });

    }).catch((err) => {
      console.error('Error obteniendo usuarios: ', err);
      this.cargando.hide();
    });
  }

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
        this.vehiculoServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Vehiculo creado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      } else {
        this.cargando.show();
        this.vehiculoServicio.editar(this.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, Vehiculo actualizado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }

    }
  }

}
