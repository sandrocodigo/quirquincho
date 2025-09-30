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


@Component({
  selector: 'app-egreso-traspaso',
  templateUrl: './egreso-traspaso.component.html',
  styleUrl: './egreso-traspaso.component.scss',
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
    NgSelectModule

  ],
})
export class EgresoTraspasoComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  boton = false;

  listaVehiculos: any = [];

  listaTipos = tiposEgresos;

  listaSucursales = sucursales;
  listaSucursalesDestino: any = [];

  usuario: any | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EgresoTraspasoComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private egresoServicio: EgresoService,
    private vehiculoServicio: VehiculoService,
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
          sucursalDestino: [null, [Validators.required]],

          tipo: [{ value: 'TRASPASO', disabled: true }, [Validators.required]],

          formaPago: ['OTRO', [Validators.required]],

          // codigo: [null, [Validators.required]],
          descripcion: ['TRASPASO ENTRE SUCURSALES'],

          vehiculoId: [null, [Validators.required]],
          vehiculoNumero: [null, [Validators.required]],
          vehiculoPlaca: [null, [Validators.required]],
          vehiculoInterno: [null, [Validators.required]],

          subtotal: [0],
          descuento: [0],
          itbms: [0],
          total: [0],
          totalGeneral: [0],

          porcentajeDescuento: [0],
          porcentajeImpuesto: [0],

          finalizado: [false],
          aprobado: [false],
          pagado: [false],

          traspaso: [true],
          traspasado: [false],
          activo: [true],

          // Auditoria
          registroUsuario: [this.usuario.email],
          registroFecha: [this.fechaHoy],
          fechaRegistro: [this.fechaHoy]
        });
        this.establecerSuscripcion();

      } else {
        this.egresoServicio.obtenerPorId(data.id).then(res => {

          console.log('ORDEN PARA EDITAR: ', res);

          this.registroFormGroup = this.fb.group({

            sucursal: [{ value: res.sucursal, disabled: true }, [Validators.required]],
            sucursalDestino: [res.sucursalDestino, [Validators.required]],

            tipo: [{ value: res.tipo, disabled: true }, [Validators.required]],

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
    this.obtenerVehiculos();
  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    this.r.sucursal.valueChanges.subscribe((val: any) => {
      this.listaSucursalesDestino = this.obtenerSucursales();
    });
    this.r.vehiculoId.valueChanges.subscribe((val: any) => {
      this.obtenerDatosVehiculo();
    });
  }

  obtenerVehiculos() {
    this.vehiculoServicio.obtenerTodos().then((data: any) => {
      // this.listaClientes = data;
      this.listaVehiculos = data.map((res: any) => { res.dato = res.interno + ' - ' + res.placa; return res });
    })
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
        this.cargando.show();
        this.egresoServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, registrado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(respuesta);
          this.cargando.hide();
        });
      } else {
        this.egresoServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, actualizacion con exito...', 'OK', {
            duration: 10000
          });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }

    }
  }

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

  obtenerSucursales() {
    const sucursalOrigen = this.r.sucursal.value;
    return this.listaSucursales.filter(sucursal => sucursal.id !== sucursalOrigen);
  }

}
