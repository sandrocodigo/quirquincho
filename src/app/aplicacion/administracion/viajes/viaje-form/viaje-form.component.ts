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

import { NgSelectModule } from '@ng-select/ng-select';

import { AuthService } from '../../../servicios/auth.service';
import { ClienteService } from '../../../servicios/cliente.service';
import { ViajeService } from '../../../servicios/viaje.service';
import { VehiculoService } from '../../../servicios/vehiculo.service';
import { paradas } from '../../../datos/paradas';


@Component({
  selector: 'app-viaje-form',
  templateUrl: './viaje-form.component.html',
  styleUrl: './viaje-form.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,

    NgSelectModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,

  ],

})
export class ViajeFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  listaClientes: any;
  listaVehiculos: any;
  listaFormas = ['CONTADO', 'CREDITO'];
  listaParadas = paradas;

  listaTerminos = [
    "Esta cotización es válida por veinte y cinco (25) días a partir de la fecha.",
    "Garantia de 1 año, entrega en dos días hábiles.",
    "Tiempo estimado de trabajos: Por definir una vez evaluado y aprobado por el Clientes.",
    "Trabajos adicionales a esta propuesta incluyen cargos adicionales.",
    "Forma de pago: 50% de abono previo al inicio de los trabajos y 50% contra entrega.",
    "....."
  ];

  usuario: any | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViajeFormComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    private viajeServicio: ViajeService,
    private clienteServicio: ClienteService,
    private vehiculoServicio: VehiculoService,
  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }

      if (data.nuevo) {

        const fechaNueva = new Date().toISOString().split('T')[0];
        const horaNueva = new Date().toTimeString().split(' ')[0];

        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 2;

        this.registroFormGroup = this.fb.group({
          sucursal: ['SUCURSAL_1', [Validators.required]],

          fecha: [fechaNueva, [Validators.required]],
          hora: [horaNueva, [Validators.required]],

          formaPago: ['CONTADO', [Validators.required]],
          parada: [null, [Validators.required]],
          origen: [null, [Validators.required]],
          destino: [null, [Validators.required]],
          precio: [null, [Validators.required]],
          descripcion: ['Viaje.....'],


          clienteId: [null, [Validators.required]],
          clienteNumero: [],
          clienteEmpresa: [],
          clienteResponsable: [null, [Validators.required]],
          clienteTelefono: [],
          clienteEmail: [],

          vehiculoId: [null, [Validators.required]],
          vehiculoNumero: [],
          vehiculoPlaca: [],
          vehiculoModelo: [],
          vehiculoColor: [],

          conductor: [],
          conductorLicencia: [],
          conductorTelefono: [],
          conductorEmail: [],




          terminos: [this.listaTerminos],

          subtotal: [0],
          descuento: [0],
          itbms: [0],
          total: [0],
          totalGeneral: [0],

          porcentajeDescuento: [0],
          porcentajeImpuesto: [13],

          solicitado: [false],
          rechazado: [false],
          aceptado: [false],
          finalizado: [false],

          procesado: [false],
          activo: [true],

          usuarioRegistro: [this.usuario.email],
          fechaRegistro: [this.fechaHoy]
        });
        this.establecerSuscripcion();
      } else {
        this.viajeServicio.obtenerPorId(data.id).then(res => {
          this.registroFormGroup = this.fb.group({

            fecha: [res.fecha, [Validators.required]],
            hora: [res.hora, [Validators.required]],

            formaPago: [res.formaPago, [Validators.required]],
            parada: [res.parada, [Validators.required]],
            origen: [res.origen, [Validators.required]],
            destino: [res.destino, [Validators.required]],
            precio: [res.precio, [Validators.required]],
            descripcion: [res.descripcion],


            clienteId: [res.clienteId],
            clienteNumero: [res.clienteNumero],
            clienteEmpresa: [res.clienteEmpresa],
            clienteResponsable: [res.clienteResponsable, [Validators.required]],
            clienteTelefono: [res.clienteTelefono],
            clienteEmail: [res.clienteEmail],

            vehiculoId: [res.vehiculoId, [Validators.required]],
            vehiculoNumero: [res.vehiculoNumero, [Validators.required]],
            vehiculoPlaca: [res.vehiculoPlaca],
            vehiculoModelo: [res.vehiculoModelo],
            vehiculoColor: [res.vehiculoColor],
            conductor: [res.conductor],
            conductorLicencia: [res.conductorLicencia],
            conductorTelefono: [res.conductorTelefono],
            conductorEmail: [res.conductorEmail],

            subtotal: [res.subtotal],
            descuento: [res.descuento],
            itbms: [res.itbms],
            total: [res.total],
            totalGeneral: [res.totalGeneral],

            porcentajeDescuento: [res.porcentajeDescuento],
            porcentajeImpuesto: [res.porcentajeImpuesto],

            finalizado: [res.finalizado],
            procesado: [res.procesado],
            activo: [res.activo],

            rechazado: [res.rechazado],

            usuarioEditor: [this.usuario.email],
            fechaActualizacion: [this.fechaHoy]
          });
          this.establecerSuscripcion();
        });
      }

    });



  }

  // INICIAR
  ngOnInit() {
    setTimeout(() => {
      this.obtenerCliente();
      this.obtenerVehiculos();
    }, 300);
  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  obtenerCliente() {
    this.clienteServicio.obtenerTodos().then((data: any) => {
      // this.listaClientes = data;

      this.listaClientes = data.map((res: any) => { res.dato = res.empresa + ': ' + res.responsable; return res });

    })
  }

  obtenerVehiculos() {
    this.vehiculoServicio.obtenerTodos().then((data: any) => {
      // this.listaVehiculos = data;

      this.listaVehiculos = data.map((res: any) => { res.dato = res.numero + ': ' + res.placa + ', ' + res.conductor; return res });

    })
  }

  establecerSuscripcion() {
    this.r.clienteId.valueChanges.subscribe((val: any) => {
      this.obtenerDatosCliente();
    });
    this.r.vehiculoId.valueChanges.subscribe((val: any) => {
      this.obtenerDatosVehiculo();
      this.r.rechazado.setValue(false);
    });

    this.r.hora.valueChanges.subscribe((val: any) => {
      console.log('HORA: ', val);
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
        this.viajeServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, registrado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(respuesta);
          this.cargando.hide();
        });
      } else {
        this.viajeServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, actualizacion con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }

    }
  }

  obtenerDatosCliente() {
    const idCliente = this.r.clienteId.value; // Obtener el ID del cliente desde el formulario

    // Buscar el cliente en la lista de clientes usando 'find'
    const clienteEncontrado = this.listaClientes.find((cliente: any) => cliente.id === idCliente);

    console.log('CLIENTE ENCONTRADO: ', clienteEncontrado)
    // Si se encuentra el cliente, llenar los valores en el formulario
    if (clienteEncontrado) {
      this.r.clienteNumero.setValue(clienteEncontrado.numero);
      this.r.clienteEmpresa.setValue(clienteEncontrado.empresa);
      this.r.clienteResponsable.setValue(clienteEncontrado.responsable);
      this.r.clienteTelefono.setValue(clienteEncontrado.telefono);
      this.r.clienteEmail.setValue(clienteEncontrado.email);
      this.r.formaPago.setValue(clienteEncontrado.formaPago);
    } else {
      // Si no se encuentra el cliente, puedes manejar el caso (mostrar un mensaje, limpiar los campos, etc.)
      this.r.clienteNumero.setValue('');
      this.r.clienteEmpresa.setValue('');
      this.r.clienteResponsable.setValue('');
      this.r.clienteTelefono.setValue('');
      this.r.clienteEmail.setValue('');
      this.r.formaPago.setValue('');
      console.log('Cliente no encontrado');
    }
  }

  obtenerDatosVehiculo() {
    const idVehiculo = this.r.vehiculoId.value;
    const vehiculoEncontrado = this.listaVehiculos.find((vehiculo: any) => vehiculo.id === idVehiculo);

    console.log('Vehiculo encontrado', vehiculoEncontrado);

    // Si se encuentra el cliente, llenar los valores en el formulario
    if (vehiculoEncontrado) {

      this.r.vehiculoNumero.setValue(vehiculoEncontrado.numero);

      this.r.vehiculoPlaca.setValue(vehiculoEncontrado.placa);
      this.r.vehiculoModelo.setValue(vehiculoEncontrado.modelo);
      this.r.vehiculoColor.setValue(vehiculoEncontrado.color);

      this.r.conductor.setValue(vehiculoEncontrado.conductor);
      this.r.conductorLicencia.setValue(vehiculoEncontrado.conductorLicencia);
      this.r.conductorTelefono.setValue(vehiculoEncontrado.conductorTelefono);
      this.r.conductorEmail.setValue(vehiculoEncontrado.conductorEmail);

    } else {
      // Si no se encuentra el cliente, puedes manejar el caso (mostrar un mensaje, limpiar los campos, etc.)

      this.r.vehiculoNumero.setValue('');
      this.r.vehiculoPlaca.setValue('');
      this.r.vehiculoModelo.setValue('');
      this.r.vehiculoColor.setValue('');

      this.r.conductor.setValue('');
      this.r.conductorLicencia.setValue('');
      this.r.conductorTelefono.setValue('');
      this.r.conductorEmail.setValue('');

      console.log('Cliente no encontrado');
    }
  }


}
