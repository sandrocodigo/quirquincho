import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { ActivatedRoute, Router, RouterModule, } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ViajeService } from '../../../servicios/viaje.service';
import { AuthService } from '../../../servicios/auth.service';
import { UbicacionService } from '../../../servicios/ubicacion.service';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { ViajeFormComponent } from '../viaje-form/viaje-form.component';
import { WhatsappService } from '../../../servicios/whatsapp.service';
import { ViajeWhatsappComponent } from '../viaje-whatsapp/viaje-whatsapp.component';


@Component({
  selector: 'app-viaje-detalle',
  templateUrl: './viaje-detalle.component.html',
  styleUrl: './viaje-detalle.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],

  providers: [DatePipe],
})
export class ViajeDetalleComponent {
  idViaje: any;
  viaje: any;

  usuario: any | null = null;

  private viajeSubscripcion!: Subscription;

  constructor(
    public router: Router,
    private ruta: ActivatedRoute,
    private dialog: MatDialog,
    private viajeServicio: ViajeService,
    private titleService: Title,
    private datePipe: DatePipe,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    private whatsappServicio: WhatsappService,
    public ubicacionService: UbicacionService,
  ) {
    this.idViaje = this.ruta.snapshot.paramMap.get('id');
    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;

      }
    });
  }

  ngOnInit() {
    this.obtenerViaje();
    // this.obtenerUbicacion();
  }

  obtenerViaje(): void {
    this.viajeSubscripcion = this.viajeServicio.obtenerPorIdTR(this.idViaje).subscribe((res: any) => {
      this.viaje = res;

      console.log('VIAJE', this.viaje)

      // Invertir el formato de la fecha
      // const fechaInvertida = this.datePipe.transform(this.programa.fecha, 'dd/MM/yyyy');
      // const titulo = this.programa.usuario.split('@')[0] + ' - ' + fechaInvertida;

      const titulo = 'Viaje: ' + this.viaje.codigo;
      this.titleService.setTitle(titulo.toUpperCase());
    });
  }

  editar(): void {
    const dialogRef = this.dialog.open(ViajeFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: this.idViaje,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerViaje();
      }
    });
  }

  aceptarViaje() {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'ACEPTAR VIAJE',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: this.viaje.descripcion
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.cargando.show();
        this.ubicacionService
          .obtenerUbicacionActual()
          .then(() => {
            /*             console.log('Ubicación obtenida con éxito');
                        console.log('Latitud:', this.ubicacionService.latitud);
                        console.log('Longitud:', this.ubicacionService.longitud);
                        console.log('Dirección:', this.ubicacionService.direccionExacta); */


            this.viajeServicio.editar(this.idViaje, {

              aceptadoCoordenadas: {
                latitude: parseFloat(this.ubicacionService.latitud),
                longitude: parseFloat(this.ubicacionService.longitud),
              },
              aceptadoDireccion: this.ubicacionService.direccionExacta,

              aceptadoUsuario: this.usuario.email,
              aceptadoFecha: new Date(),
              aceptado: true,

              conductorAceptado: true
            }).then(res => {
              this.obtenerViaje();
              this.cargando.hide();
            })


          })
          .catch((error) => {
            console.error('Error al obtener la ubicación:', error);
            this.cargando.hide();
          });


      }
    });
  }

  finalizarViaje() {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'FINALIZAR VIAJE',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: 'Sr. Conductor, Muchas Gracias'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.cargando.show();
        this.ubicacionService
          .obtenerUbicacionActual()
          .then(() => {
            /*             console.log('Ubicación obtenida con éxito');
                        console.log('Latitud:', this.ubicacionService.latitud);
                        console.log('Longitud:', this.ubicacionService.longitud);
                        console.log('Dirección:', this.ubicacionService.direccionExacta); */

            this.viajeServicio.editar(this.idViaje, {

              finalizadoCoordenadas: {
                latitude: parseFloat(this.ubicacionService.latitud),
                longitude: parseFloat(this.ubicacionService.longitud),
              },
              finalizadoDireccion: this.ubicacionService.direccionExacta,

              finalizadoUsuario: this.usuario.email,
              finalizadoFecha: new Date(),
              finalizado: true,
            }).then(res => {
              this.obtenerViaje();
              this.cargando.hide();
            })

          })
          .catch((error) => {
            console.error('Error al obtener la ubicación:', error);
            this.cargando.hide();
          });
      }
    });
  }

  obtenerUbicacion(): void {
    this.cargando.show();
    this.ubicacionService
      .obtenerUbicacionActual()
      .then(() => {
        console.log('Ubicación obtenida con éxito');
        console.log('Latitud:', this.ubicacionService.latitud);
        console.log('Longitud:', this.ubicacionService.longitud);
        console.log('Dirección:', this.ubicacionService.direccionExacta);
        this.cargando.hide();
      })
      .catch((error) => {
        console.error('Error al obtener la ubicación:', error);
        this.cargando.hide();
      });
  }

  actualizarViaje(datos: any): void {
    this.viajeServicio.editar(this.idViaje, datos).then(() => {
      this.obtenerViaje();
    });
  }


  enviarPorWhatsApp(fila: any) {

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

  enviarWat(fila: any) {
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

  // Identificador de la aplicación 476654505445723
  // Identificador de la cuenta de WhatsApp Business: 535822226272871

  testWebhook() {
    const mockPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '535822226272871',
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '50762657230',
                    interactive: {
                      button_reply: {
                        id: 'disponible',
                        title: 'Estoy disponible',
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    this.whatsappServicio.testWebhook(mockPayload).subscribe(
      (response) => {
        console.log('Webhook responded:', response);
      },
      (error) => {
        console.error('Webhook error:', error);
      }
    );
  }


  addPersona() {

    const data = {
      nombre: 'Sandro2',
      email: 'sandro2.codigo@gmail.com',
      edad: 36,
    };

    this.whatsappServicio.addPersona(data).subscribe({
      next: (response) => {
        console.log('API responded:', response);
      },
      error: (error) => {
        console.error('Webhook error:', error);
      },
      complete: () => {
        console.log('Operación completada.');
      },
    });
  }

  whatsapp(): void {
    const dialogRef = this.dialog.open(ViajeWhatsappComponent, {
      width: '800px',
      data: {
        nuevo: false,
        viaje: this.viaje,
        id: this.idViaje,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  ngOnDestroy(): void {
    if (this.viajeSubscripcion) {
      this.viajeSubscripcion.unsubscribe();
    }
  }
}
