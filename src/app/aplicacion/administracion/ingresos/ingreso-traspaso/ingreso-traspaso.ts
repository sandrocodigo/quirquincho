import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../servicios/auth.service';
import { EgresoService } from '../../../servicios/egreso.service';

import { tiposEgresos } from '../../../modelos/tipos';
import { sucursales } from '../../../datos/sucursales';

import { NgSelectModule } from '@ng-select/ng-select';
import { VehiculoService } from '../../../servicios/vehiculo.service';
import { IngresoService } from '../../../servicios/ingreso.service';
import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';


@Component({
  selector: 'app-ingreso-traspaso',
  templateUrl: './ingreso-traspaso.html',
  styleUrl: './ingreso-traspaso.css',
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
    NgSelectModule

  ],
})
export class IngresoTraspaso {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  boton = false;

  listaVehiculos: any = [];
  listaEgresos: any = [];

  listaTipos = tiposEgresos;

  listaSucursales = sucursales;
  listaSucursalesDestino: any = [];

  usuario: any | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<IngresoTraspaso>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private ingresoServicio: IngresoService,
    private egresoServicio: EgresoService,
    private egresoDetalleServicio: EgresoDetalleService,
    private ingresoDetalleServicio: IngresoDetalleService,
    public authServicio: AuthService,
  ) {

    this.authServicio.user$.subscribe((user) => {
      this.usuario = user;

      // console.log('USUARIO_EMAIL: ', this.usuario.email);
      if (data.nuevo) {
        const fechaNueva = new Date().toISOString().split('T')[0];

        // const fechaActual = new Date();
        // const mesActual = fechaActual.getMonth() + 2;

        this.registroFormGroup = this.fb.group({
          fecha: [fechaNueva, [Validators.required]],

          sucursal: [null, [Validators.required]],

          tipo: [{ value: 'TRASPASO', disabled: true }, [Validators.required]],

          egresoId: [null, [Validators.required]],
          egresoCodigo: [null, [Validators.required]],
          egresoSucursalOrigen: [null, [Validators.required]],
          egresoSucursalDestino: [null, [Validators.required]],

          descripcion: ['TRASPASO ENTRE SUCURSALES'],

          vehiculoId: [null, [Validators.required]],
          vehiculoNumero: [null, [Validators.required]],
          vehiculoPlaca: [null, [Validators.required]],
          vehiculoInterno: [null, [Validators.required]],

          total: [0],

          finalizado: [false],
          aprobado: [false],


          traspaso: [true],
          activo: [true],

          // Auditoria
          registroUsuario: [this.usuario.email],
          registroFecha: [this.fechaHoy],
          fechaRegistro: [this.fechaHoy]
        });
        this.establecerSuscripcion();

      } else {
        this.ingresoServicio.obtenerPorId(data.id).then(res => {

          console.log('ORDEN PARA EDITAR: ', res);

          this.registroFormGroup = this.fb.group({

            sucursal: [{ value: res.sucursal, disabled: true }, [Validators.required]],
            sucursalDestino: [res.sucursalDestino, [Validators.required]],

            tipo: [{ value: res.tipo, disabled: true }, [Validators.required]],

            egresoId: [res.egresoId, [Validators.required]],
            egresoCodigo: [res.egresoCodigo, [Validators.required]],
            egresoSucursalOrigen: [res.egresoSucursalOrigen, [Validators.required]],
            egresoSucursalDestino: [res.egresoSucursalDestino, [Validators.required]],

            descripcion: [res.descripcion, [Validators.required]],

            vehiculoId: [res.vehiculoId],
            vehiculoNumero: [res.vehiculoNumero],
            vehiculoInterno: [res.vehiculoInterno],
            vehiculoPlaca: [res.vehiculoPlaca],

            // Auditoria
            edicionUsuario: [this.usuario.email],
            edicionFecha: [this.fechaHoy]


          });
          this.establecerSuscripcion();
          this.listaSucursalesDestino = this.obtenerSucursales();
        });
      }
    });

  }

  // INICIAR
  ngOnInit() {
    // console.log('sucursales: ', this.listaSucursales);
  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    this.r.sucursal.valueChanges.subscribe((val: any) => {
      this.obtenerEgresosPorTraspasoPendientes();
    });
    this.r.egresoId.valueChanges.subscribe((val: any) => {
      this.obtenerDatosEgreso();
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
      this.boton = true;
      if (this.data.nuevo) {
        this.cargando.show('Realizando traspaso...');
        this.ingresoServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.cargando.hide();
          this.snackbar.open('Hey!, registrado con exito...', 'OK', { duration: 10000 });

          this.ingresoServicio.obtenerPorId(respuesta.id).then(ingreso => {

            this.cargando.show('Obteniendo detalle de Egreso...');
            this.egresoDetalleServicio.obtenerPorEgreso(this.r.egresoId.value)
              .then(egresoDetalle => {

                const fechaRegistro = new Date();
                const fecha = new Date().toISOString().split('T')[0];

                egresoDetalle.forEach((item: any) => {
                  const nuevoIngresoDetalle = {

                    fecha: fecha,
                    sucursal: ingreso.sucursal,

                    ingresoId: respuesta.id,
                    ingresoCodigo: ingreso.codigo,
                    ingresoDescripcion: ingreso.descripcion,


                    productoId: item.productoId,
                    productoTipo: item.productoTipo,
                    productoCodigo: item.productoCodigo,
                    productoDescripcion: item.productoDescripcion,
                    productoCodigoBarra: item.productoCodigoBarra,
                    productoFotosUrl: item.productoFotosUrl,

                    cantidad: item.cantidad,
                    cantidadSaldo: item.cantidad,
                    pc: item.pc,
                    pv: item.pv,
                    subtotal: item.subtotal,

                    fechaRegistro: fechaRegistro,
                    finalizado: false,
                    observado: false,

                    // Auditoria
                    registroUsuario: this.usuario.email,
                    registroFecha: new Date()
                  };
                  this.ingresoDetalleServicio.crear(nuevoIngresoDetalle)
                    .then(() => {
                      console.log('Detalle de ingreso creado:', nuevoIngresoDetalle);
                      this.cargando.hide();
                    })
                    .catch(err => {
                      console.error('Error al crear detalle de ingreso:', err);
                    });
                });

              })
              .catch(err => {
                console.error('obtenerEgresoDetalle error', err);
                this.snackbar.open('Error al cargar el detalle', 'OK', { duration: 3000 });
              })
              .finally(() => {
                this.cargando.hide();

                this.dialogRef.close(respuesta);
              });
          });







        });
      } else {
        this.ingresoServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, actualizacion con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }
    }
  }

  obtenerDatosEgreso() {
    const idEgreso = this.r.egresoId.value; // Obtener el ID del cliente desde el formulario

    // Buscar usando 'find'
    const datoEncontrado = this.listaEgresos.find((egreso: any) => egreso.id === idEgreso);

    // Si se encuentra, llenar los valores en el formulario
    if (datoEncontrado) {
      this.r.egresoCodigo.setValue(datoEncontrado.codigo);
      this.r.egresoSucursalOrigen.setValue(datoEncontrado.sucursal);
      this.r.egresoSucursalDestino.setValue(datoEncontrado.sucursalDestino);
      this.r.descripcion.setValue(datoEncontrado.descripcion);

      this.r.vehiculoId.setValue(datoEncontrado.vehiculoId);
      this.r.vehiculoNumero.setValue(datoEncontrado.vehiculoNumero);
      this.r.vehiculoPlaca.setValue(datoEncontrado.vehiculoPlaca);
      this.r.vehiculoInterno.setValue(datoEncontrado.vehiculoInterno);

    } else {
      // Si no se encuentra, puedes manejar el caso (mostrar un mensaje, limpiar los campos, etc.)
      this.r.egresoCodigo.setValue('');
      this.r.egresoSucursalOrigen.setValue('');
      this.r.egresoSucursalDestino.setValue('');
      this.r.descripcion.setValue('');

      this.r.vehiculoId.setValue('');
      this.r.vehiculoNumero.setValue('');
      this.r.vehiculoPlaca.setValue('');
      this.r.vehiculoInterno.setValue('');

      console.log('no encontrado');
    }
  }

  obtenerSucursales() {
    const sucursalOrigen = this.r.sucursal.value;
    return this.listaSucursales.filter(sucursal => sucursal.id !== sucursalOrigen);
  }

  obtenerEgresosPorTraspasoPendientes() {
    this.cargando.show('Cargando egresos por traspaso pendientes...');
    const sucursal = this.r.sucursal.value;
    console.log('SUCURSAL: ', sucursal);
    this.egresoServicio.obtenerEgresosPorTraspasoPendientes(sucursal).then((respuesta: any) => {
      this.cargando.hide();
      this.listaEgresos = respuesta;
      console.log('EGRESOS PENDIENTES: ', respuesta);
    });
  }

}
