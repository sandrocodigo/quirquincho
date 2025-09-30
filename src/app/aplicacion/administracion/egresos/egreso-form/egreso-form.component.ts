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
import { ClienteService } from '../../../servicios/cliente.service';
import { ClienteFormComponent } from '../../clientes/cliente-form/cliente-form.component';


import { tiposEgresos } from '../../../modelos/tipos';
import { sucursales } from '../../../datos/sucursales';
import { OrdenService } from '../../../servicios/orden.service';

import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-egreso-form',
  templateUrl: './egreso-form.component.html',
  styleUrls: ['./egreso-form.component.scss'],
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
export class EgresoFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  boton = false;

  listaClientes: any = [];
  listaOrdenes: any = [];

  listaTipos = tiposEgresos;
  listaFormas = ['CONTADO', 'CREDITO'];

  listaSucursales = sucursales;

  usuario: any | null = null;

  orden: any

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EgresoFormComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private auth: AuthService,
    private egresoServicio: EgresoService,
    private clienteServicio: ClienteService,
    public authServicio: AuthService,
    private ordenServicio: OrdenService,
  ) {

    this.authServicio.user$.subscribe((user) => {
      this.usuario = user;



      // console.log('USUARIO_EMAIL: ', this.usuario.email);
      if (data.nuevo) {
        const fechaNueva = new Date().toISOString().split('T')[0];
        this.orden = data.orden || null;
        const sucursalNuevo = this.orden ? this.orden.sucursal : null;
        const ordenNuevo = this.orden ? this.orden.id : null;
        const descripcionNuevo = this.orden ? this.orden.mantenimientoDescripcion : null;
        // const fechaActual = new Date();
        // const mesActual = fechaActual.getMonth() + 2;

        this.registroFormGroup = this.fb.group({
          fecha: [fechaNueva, [Validators.required]],
          sucursal: [sucursalNuevo, [Validators.required]],
          tipo: ['MANTENIMIENTO', [Validators.required]],

          formaPago: ['CONTADO', [Validators.required]],

          clienteId: ['48QClCW685cK6GLqwstf', [Validators.required]],
          clienteNumero: [0],
          clienteEmpresa: ['S/N'],
          clienteResponsable: ['S/N'],
          clienteTelefono: [0],
          clienteEmail: ['sincorreo@gmail.com'],
          clienteRUC: [0],

          // codigo: [null, [Validators.required]],
          descripcion: [descripcionNuevo],

          subtotal: [0],
          descuento: [0],
          itbms: [0],
          total: [0],
          totalGeneral: [0],

          porcentajeDescuento: [0],
          porcentajeImpuesto: [0],

          ordenId: [ordenNuevo],
          ordenCodigo: [null],
          vehiculoInterno: [null],
          vehiculoPlaca: [null],
          mantenimientoDescripcion: [null],

          finalizado: [false],
          aprobado: [false],
          pagado: [false],

          activo: [true],

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

            tipo: [res.tipo, [Validators.required]],
            formaPago: [res.formaPago],

            clienteId: [res.clienteId],
            clienteNumero: [res.clienteNumero],
            clienteEmpresa: [res.clienteEmpresa],
            clienteResponsable: [res.clienteResponsable],
            clienteTelefono: [res.clienteTelefono],
            clienteEmail: [res.clienteEmail],
            clienteRUC: [res.clienteRUC],

            descripcion: [res.descripcion, [Validators.required]],

            porcentajeDescuento: [res.porcentajeDescuento],
            porcentajeImpuesto: [res.porcentajeImpuesto],

            usuarioEditor: [this.auth.obtenerUsuario.email],
            fechaActualizacion: [this.fechaHoy],

            ordenId: [res.ordenId],
            ordenCodigo: [res.ordenCodigo],
            vehiculoInterno: [res.vehiculoInterno],
            vehiculoPlaca: [res.vehiculoPlaca],
            mantenimientoDescripcion: [res.mantenimientoDescripcion],

            edicionUsuario: [this.usuario.email],
            edicionFecha: [this.fechaHoy],


          });
          this.establecerSuscripcion();
        });
      }
    });

  }

  // INICIAR
  ngOnInit() {
    //this.obtenerCliente();
    this.obtenerOrdenes();
  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    this.r.clienteId.valueChanges.subscribe((val: any) => {
      this.obtenerDatosCliente();
    });
    this.r.ordenId.valueChanges.subscribe((val: any) => {
      this.obtenerDatosOrden();
    });

  }

  // OBTENER USUARIO
  obtenerCliente() {
    this.clienteServicio.obtenerTodos().then((data: any) => {
      console.log('CLIENTES: ', data);
      // this.listaClientes = data;

      this.listaClientes = data.map((res: any) => { res.dato = res.empresa + ' - ' + res.responsable; return res });
    })
  }

  // OBTENER USUARIO
  obtenerOrdenes() {
    this.ordenServicio.obtenerActivos().then((res: any) => {
      console.log('ORDENES ACTIVOS: ', res);

      this.listaOrdenes = [
        { id: 'NINGUNO', dato: 'NINGUNO' },
        ...res.map((res: any) => {
          res.dato = res.codigo + ' - ' + res.vehiculoInterno + ' / ' + res.vehiculoPlaca + ' / ' + res.mantenimientoDescripcion;
          return res;
        })
      ];

      this.obtenerDatosOrden();

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
      this.r.clienteRUC.setValue(clienteEncontrado.ruc);
    } else {
      // Si no se encuentra el cliente, puedes manejar el caso (mostrar un mensaje, limpiar los campos, etc.)
      this.r.clienteNumero.setValue('');
      this.r.clienteEmpresa.setValue('');
      this.r.clienteResponsable.setValue('');
      this.r.clienteTelefono.setValue('');
      this.r.clienteEmail.setValue('');
      this.r.clienteRUC.setValue('');

      console.log('Cliente no encontrado');
    }
  }

  // NUEVO
  nuevoCliente(): void {
    const dialogRef = this.dialog.open(ClienteFormComponent, {
      width: '80%',
      data: {
        nuevo: true,
        objeto: null
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerCliente();
      }
    });
  }

  obtenerDatosOrden() {
    const idOrden = this.r.ordenId.value;
    const ordenEncontrado = this.listaOrdenes.find((orden: any) => orden.id === idOrden);

    console.log('ORDEN ENCONTRADO: ', ordenEncontrado)
    // Si se encuentra el cliente, llenar los valores en el formulario
    if (ordenEncontrado) {

      if (ordenEncontrado.id === 'NINGUNO') {
        this.r.ordenCodigo.setValue('');
        this.r.vehiculoInterno.setValue('');
        this.r.vehiculoPlaca.setValue('');
        this.r.mantenimientoDescripcion.setValue('');
      } else {
        this.r.ordenCodigo.setValue(ordenEncontrado.codigo);
        this.r.vehiculoInterno.setValue(ordenEncontrado.vehiculoInterno);
        this.r.vehiculoPlaca.setValue(ordenEncontrado.vehiculoPlaca);
        this.r.mantenimientoDescripcion.setValue(ordenEncontrado.mantenimientoDescripcion);
      }


    } else {
      // Si no se encuentra el cliente, puedes manejar el caso (mostrar un mensaje, limpiar los campos, etc.)
      this.r.ordenCodigo.setValue('');
      this.r.vehiculoInterno.setValue('');
      this.r.vehiculoPlaca.setValue('');
      this.r.mantenimientoDescripcion.setValue('');

      console.log('no encontrado');
    }
  }
}
