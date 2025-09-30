import { Component, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';

import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { limites } from '../../../datos/limites';

import { AuthService } from '../../../servicios/auth.service';
import { Title } from '@angular/platform-browser';

import { ClienteService } from '../../../servicios/cliente.service';
import { MatMenuModule } from '@angular/material/menu';
import { ViajeFormComponent } from '../viaje-form/viaje-form.component';
import { ViajeService } from '../../../servicios/viaje.service';
import { VehiculoService } from '../../../servicios/vehiculo.service';

@Component({
  selector: 'app-viaje-lista',
  templateUrl: './viaje-lista.component.html',
  styleUrl: './viaje-lista.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatTooltip,
    MatMenuModule
  ],

  providers: [DatePipe],
})
export class ViajeListaComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;
  lista: any;

  limites = limites;

  listaClientes: any;
  listaVehiculos: any;

  fechaHoy = new Date().toISOString().split('T')[0];

  // Obtener la fecha actual
  hoy = new Date();

  // Crear una nueva fecha con el primer día del mes actual
  primerDiaDelMes = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1);

  // Formatear la fecha al formato "YYYY-MM-DD"
  fechaInicial = this.primerDiaDelMes.toISOString().split('T')[0];

  // fechas = this.obtenerFechas();

  // DataSource para la tabla
  dataSource = new MatTableDataSource<any>([]);

  // Nombre de las columnas que se mostrarán
  displayedColumns: string[] = ['codigo', 'clienteEmpresa', 'vehiculoNumero', 'origen', 'precio', 'aceptado', 'finalizado', 'opciones'];

  // ViewChild para manejar el ordenamiento
  @ViewChild(MatSort) sort!: MatSort;


  usuario: any | null = null;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private cargando: SpinnerService,
    private viajeServicio: ViajeService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private authServicio: AuthService,
    private titleService: Title,
    private clienteServicio: ClienteService,
    private vehiculoServicio: VehiculoService,
    private datePipe: DatePipe,
  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }
    });

    // const fechaGuardada = localStorage.getItem('fechaSeleccionada');
    // this.fechaHoy = fechaGuardada ? fechaGuardada : new Date().toISOString().split('T')[0];

    this.buscadorFormGroup = this.fb.group({
      sucursal: ['SUCURSAL_1'],

      fechaInicio: [this.fechaHoy],
      fechaFinal: [this.fechaHoy],

      vehiculo: ['TODOS'],
      cliente: ['TODOS'],
      finalizado: ['TODOS'],
      procesado: ['TODOS'],

      limite: [100],
    });
    this.obtenerConsulta();
    this.establecerSuscripcionForm();

  }

  ngOnInit() {
    this.titleService.setTitle('Viajes');
    this.obtenerCliente();
    this.obtenerVehiculos();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // FORM
  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.finalizado.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.fechaInicio.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.procesado.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.vehiculo.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.cliente.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.finalizado.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
  }

  // OBTENER USUARIO
  obtenerCliente() {
    this.clienteServicio.obtenerTodos().then((data: any) => {
      this.listaClientes = data;
    })
  }

  obtenerVehiculos() {
    this.vehiculoServicio.obtenerTodos().then((data: any) => {
      this.listaVehiculos = data;
    })
  }

  // OBTENER CONSULAR
  obtenerConsulta() {
    this.cargando.show();
    this.viajeServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then(res => {
      console.log('CONSULTA', res);
      const resultadosOrdenados = res.sort((a: any, b: any) => b.codigo - a.codigo);
      this.dataSource.data = resultadosOrdenados;
      this.cargando.hide();
    });
  }

  nuevo(): void {
    const dialogRef = this.dialog.open(ViajeFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerConsulta();
        this.router.navigate(['/administracion/viajes/detalle/' + result.id]);
      }
    });
  }

  editar(fila: any): void {
    const dialogRef = this.dialog.open(ViajeFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        idUsuario: fila.usuarioId,
        id: fila.id,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerConsulta();
      }
    });
  }

  eliminar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Viaje',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.viajeServicio.editar(fila.id, { activo: false, usuarioEliminado: this.usuario.email, fechaEliminado: this.hoy }).then(result => {
          this.cargando.hide();
          this.snackbar.open('Eliminado...', 'OK', { duration: 10000 });
          this.obtenerConsulta();
        })
      }
    });
  }

  enviarPorWhatsApp(fila: any) {

    const urlConfirmacion = 'http://movil-torisimo.web.app/conductor/viajes/pendientes/detalle/' + fila.id;
    const {
      fecha,
      hora,
      formaPago,
      parada,
      origen,
      destino,
      precio,
      descripcion,
      clienteEmpresa,
      clienteResponsable,
      clienteTelefono,
      vehiculoNumero,
      vehiculoPlaca,
      vehiculoModelo,
      conductor,
      conductorTelefono,
    } = fila;

    // Crear el mensaje dinámico
    const mensaje = `
  Hola ${conductor},
  Tienes un nuevo viaje asignado:
  Fecha: ${this.datePipe.transform(fecha, 'dd/MM/yyyy')}
  Hora: ${hora}

  Forma de Pago: ${formaPago}

  Parada: ${parada}
  Origen: ${origen}
  Destino: ${destino}
  
  Precio: $${precio}
  Nota: ${descripcion}
  
  Detalles del Cliente:
  Empresa: ${clienteEmpresa}
  Responsable: ${clienteResponsable}
  Teléfono: ${clienteTelefono}
  
  Detalles del Vehículo:
  Número: ${vehiculoNumero}
  Placa: ${vehiculoPlaca}
  Modelo: ${vehiculoModelo}
  
  Por favor confirma si estás disponible ingresando al link:
  
  ${urlConfirmacion}
  
  `;

    // Reemplazar saltos de línea y espacios para URL
    const urlMensaje = encodeURIComponent(mensaje.trim());

    // Construir el enlace de WhatsApp
    const enlaceWhatsApp = `https://wa.me/${conductorTelefono.replace(
      /[^\d]/g,
      ""
    )}?text=${urlMensaje}`;

    // Redirigir a WhatsApp
    window.open(enlaceWhatsApp, "_blank");
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  finalizar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Finalizar viaje',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.viajeServicio.editar(fila.id, {
          finalizadoUsuario: this.usuario.email,
          finalizadoFecha: new Date(),
          finalizado: true,
        }).then(result => {
          this.cargando.hide();
          this.snackbar.open('Finalizado...', 'OK', { duration: 10000 });
          this.obtenerConsulta();
        })
      }
    });
  }

}
