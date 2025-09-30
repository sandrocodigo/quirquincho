import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { WhatsappService } from '../../../servicios/whatsapp.service';
@Component({
  selector: 'app-viaje-whatsapp',
  templateUrl: './viaje-whatsapp.component.html',
  styleUrl: './viaje-whatsapp.component.scss',
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

  providers: [DatePipe],
})
export class ViajeWhatsappComponent {

  idViaje: any;
  viaje: any;
  usuario: any | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViajeWhatsappComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    private viajeServicio: ViajeService,
    private whatsappServicio: WhatsappService,
  ) {
    this.idViaje = data.id;

    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;
        this.obtener();
      }

    });
  }

  // INICIAR
  ngOnInit() {
    setTimeout(() => {

    }, 300);
  }


  obtener() {
    this.cargando.show();
    this.viajeServicio.obtenerPorId(this.idViaje).then(res => {
      this.viaje = res;
      this.cargando.hide();
    });
  }


  enviarPorWhatsappWEB(fila: any) {

    const urlConfirmacion = 'http://movil-torisimo.web.app/conductor/viajes/pendientes/detalle/' + this.idViaje;
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
  
  Precio: Bs. ${precio}
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

  enviarLinkPorAPI(fila: any) {
    const urlConfirmacion = `http://movil-torisimo.web.app/conductor/viajes/pendientes/detalle/${this.idViaje}`;
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
    👋🏼 Hola ${conductor} 😃,
    Tienes un nuevo viaje asignado:
    🗓️ Fecha: ${this.datePipe.transform(fecha, 'dd/MM/yyyy')}
    🕢 Hora: ${hora}
    
    Forma de Pago: ${formaPago}
    
    🅿️ Parada: ${parada}
    Origen: ${origen}
    Destino: ${destino}
    
    💵 Precio: Bs. ${precio}
    📝 Nota: ${descripcion}
    
    Detalles del Cliente:
    🏢 Empresa: ${clienteEmpresa}
    🙋🏻‍♂️ Responsable: ${clienteResponsable}
    📳 Teléfono: ${clienteTelefono}
    
    Detalles del Vehículo:
    🛞 Número: ${vehiculoNumero}
    🚖 Placa: ${vehiculoPlaca}
    🛻 Modelo: ${vehiculoModelo}
  
  Por favor confirma si estás disponible ingresando al link:
  
  ${urlConfirmacion}
    `;

    this.cargando.show();

    this.whatsappServicio.enviarMensaje(conductorTelefono, mensaje.trim()).subscribe(
      (response) => {
        console.log('RESPUESTA DE WHATSAPP: ', response);
        this.cargando.hide();
      },
      (error) => {
        console.error('ERROR AL ENVIAR MENSAJE: ', error);
        this.cargando.hide();
      }
    );
  }


  enviarConfirmacion(fila: any) {
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
  
  Precio: Bs. ${precio}
  Nota: ${descripcion}
  
  Detalles del Cliente:
  Empresa: ${clienteEmpresa}
  Responsable: ${clienteResponsable}
  Teléfono: ${clienteTelefono}
  
  Detalles del Vehículo:
  Número: ${vehiculoNumero}
  Placa: ${vehiculoPlaca}
  Modelo: ${vehiculoModelo}
  
  Por favor selecciona una opción para confirmar tu disponibilidad:
    `;

    this.cargando.show();

    this.whatsappServicio.enviarBotones(conductorTelefono, mensaje.trim()).subscribe(
      (response) => {
        console.log('RESPUESTA DE WHATSAPP: ', response);
        this.cargando.hide();
      },
      (error) => {
        console.error('ERROR AL ENVIAR MENSAJE: ', error);
        this.cargando.hide();
      }
    );
  }


  copiarDatos(): void {
    const urlConfirmacion = 'http://movil-torisimo.web.app/conductor/viajes/pendientes/detalle/' + this.idViaje;
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
    } = this.viaje;

    const textoACopiar = `
    👋🏼 Hola ${conductor} 😃,
    Tienes un nuevo viaje asignado:
    🗓️ Fecha: ${this.datePipe.transform(fecha, 'dd/MM/yyyy')}
    🕢 Hora: ${hora}
    
    Forma de Pago: ${formaPago}
    
    🅿️ Parada: ${parada}
    Origen: ${origen}
    Destino: ${destino}
    
    💵 Precio: Bs. ${precio}
    📝 Nota: ${descripcion}
    
    Detalles del Cliente:
    🏢 Empresa: ${clienteEmpresa}
    🙋🏻‍♂️ Responsable: ${clienteResponsable}
    📳 Teléfono: ${clienteTelefono}
    
    Detalles del Vehículo:
    🛞 Número: ${vehiculoNumero}
    🚖 Placa: ${vehiculoPlaca}
    🛻 Modelo: ${vehiculoModelo}
    
  Por favor confirma si estás disponible ingresando al link:
  
  ${urlConfirmacion}

      `;

    /*     const textoACopiar = `
          Empresa: ${this.viaje.clienteEmpresa}
          Responsable: ${this.viaje.clienteResponsable}
          Teléfono: ${this.viaje.clienteTelefono},
          ___________________________
        `; */

    navigator.clipboard.writeText(textoACopiar).then(
      () => {
        console.log('Datos copiados al portapapeles');
        this.snackbar.open('Viaje COPIADO', 'OK', { duration: 10000 });
      },
      (error) => {
        console.error('Error al copiar los datos:', error);
        alert('Error al copiar los datos');
      }
    );
  }

}
