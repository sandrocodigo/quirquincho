import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';


import { NgSelectModule } from '@ng-select/ng-select';


import { AuthService } from '../../../servicios/auth.service';

import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';

import { Title } from '@angular/platform-browser';

import { CalculoService } from '../../../servicios/calculo.service';

import { OrdenService } from '../../../servicios/orden.service';
import { MatCardModule } from '@angular/material/card';
import { OrdenFinalizarComponent } from '../orden-finalizar/orden-finalizar.component';
import { ProgramacionService } from '../../../servicios/programacion.service';
import { EgresoFormComponent } from '../../egresos/egreso-form/egreso-form.component';
import { MatMenuModule } from '@angular/material/menu';
import { EgresoService } from '../../../servicios/egreso.service';
import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';
import { OrdenFormComponent } from '../orden-form/orden-form.component';
import { VehiculoService } from '../../../servicios/vehiculo.service';


@Component({
  selector: 'app-orden-detalle',
  templateUrl: './orden-detalle.component.html',
  styleUrl: './orden-detalle.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    MatRadioModule,
    MatCardModule,
    MatMenuModule,
    NgSelectModule

  ],
})
export class OrdenDetalleComponent {
  idOrden: any;
  orden: any;

  usuario: any | null = null;
  listaOrdenes: any = [];

  listaEgresos: any = [];
  listaEgresosDetalles: any = [];

  listaEgresosPorIdOrden: any = [];
  listaEgresosDetallesPorIdOrden: any = [];

  @ViewChild('aForm') aForm!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    public authServicio: AuthService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    public router: Router,
    private dialog: MatDialog,
    private titleService: Title,
    private ordenServicio: OrdenService,
    private pServicio: ProgramacionService,
    private calculoServicio: CalculoService,
    private egresoServicio: EgresoService,
    private egresoDetalleServicio: EgresoDetalleService,
    private vehiculoServicio: VehiculoService,
  ) {
    this.idOrden = this.ruta.snapshot.paramMap.get('id');
    this.authServicio.user$.subscribe((user) => {
      this.usuario = user;
      // console.log('USUARIO_EMAIL: ', this.usuario.email);
    });
  }

  ngOnInit() {
    this.obtenerOrden();
  }

  obtenerOrden() {
    this.cargando.show('Obteniendo orden...');
    this.ordenServicio.obtenerPorId(this.idOrden).then(res => {
      this.cargando.hide();
      console.log('ORDEN: ', res);
      this.orden = res;
      this.titleService.setTitle('Orden-Detalle: ' + this.orden.codigo);

      this.obtenerOrdenes();
      this.obtenerEgresos();
      this.obtenerEgresosDetalles();

      this.obtenerEgresosPorIdOrden();
      this.obtenerEgresosDetallesPorIdOrden();
    });
  }

  obtenerOrdenes(): void {
    this.cargando.show('Obteniendo ordenes relacionadas...');
    this.ordenServicio.obtenerPorCodigo(this.orden.codigo).then(respuesta => {
      this.cargando.hide();
      console.log('MAS ORDENES: ', respuesta);
      this.listaOrdenes = respuesta;
      // this.calcularTodo();
      //this.total = this.calcularTotal();
    });
  }

  obtenerEgresos(): void {
    this.cargando.show('Obteniendo egresos...');
    this.egresoServicio.obtenerPorOrdenCodigo(this.orden.codigo).then(respuesta => {
      this.cargando.hide();
      console.log('MAS EGRESOS: ', respuesta);
      this.listaEgresos = respuesta;
    });
  }

  obtenerEgresosPorIdOrden(): void {
    this.cargando.show();
    this.egresoServicio.obtenerPorOrdenId(this.idOrden).then(respuesta => {
      console.log('MAS EGRESOS ID ORDEN: ', respuesta);
      this.listaEgresosPorIdOrden = respuesta;
      this.cargando.hide();
    });
  }

  obtenerEgresosDetalles(): void {
    this.cargando.show();
    this.egresoDetalleServicio.obtenerPorOrdenCodigo(this.orden.codigo).then(respuesta => {
      console.log('MAS EGRESOS DETALLES: ', respuesta);
      this.listaEgresosDetalles = respuesta;
      this.cargando.hide();
    });
  }

  obtenerEgresosDetallesPorIdOrden(): void {
    this.cargando.show();
    this.egresoDetalleServicio.obtenerPorOrdenId(this.idOrden).then(respuesta => {
      console.log('MAS EGRESOS DETALLES ID ORDEN: ', respuesta);
      this.listaEgresosDetallesPorIdOrden = respuesta;
      this.cargando.hide();
    });
  }

  editar(fila: any) {
    const dialogRef = this.dialog.open(OrdenFormComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: fila.id,
        orden: this.orden,
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargar(fila.id)
      }
    });
  }

  finalizar(fila: any) {
    const dialogRef = this.dialog.open(OrdenFinalizarComponent, {
      width: '600px',
      data: {
        nuevo: true,
        id: fila.id,
        orden: fila,
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('RESULTADO: ', result);
        this.cargar(fila.id)
      }
    });
  }

  eliminar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Orden',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.ordenServicio.editar(fila.id, { activo: false, usuarioElimina: this.usuario.email }).then(result => {
          this.pServicio.editar(fila.programacionId, { ordenId: null }).then(res => {
            this.cargando.hide();
            this.snackbar.open('Eliminado...', 'OK', { duration: 10000 });
            this.obtenerOrden();
          });
        })
      }
    });
  }

  nuevoEgreso2(fila: any): void {
    const dialogRef = this.dialog.open(EgresoFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
        orden: fila
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // console.log('RESULTADO: ',result.id);
        this.router.navigate(['/administracion/egresos/detalle/' + result.id]);
        // this.obtenerConsulta();
      }
    });
  }

  nuevoEgreso(fila: any) {
    console.log('ORDEN FILA: ', fila);
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Generar nuevo Egreso',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        const nuevoEgreso = {
          fecha: new Date().toISOString().split('T')[0],
          sucursal: fila.sucursal,
          tipo: 'MANTENIMIENTO',
          formaPago: 'CONTADO',

          descripcion: 'Orden: ' + fila.codigo,

          subtotal: 0,
          descuento: 0,
          itbms: 0,
          total: 0,
          totalGeneral: 0,

          porcentajeDescuento: 0,
          porcentajeImpuesto: 0,

          ordenId: this.idOrden,
          ordenCodigo: fila.codigo,

          vehiculoId: fila.vehiculoId,
          vehiculoInterno: fila.vehiculoInterno,
          vehiculoPlaca: fila.vehiculoPlaca,
          vehiculoEmpresa: fila.vehiculoEmpresa,

          mantenimientoDescripcion: fila.mantenimientoDescripcion,
          mantenimientoTipo: fila.mantenimientoTipo,

          finalizado: false,
          aprobado: false,
          pagado: false,
          activo: true,

          registroUsuario: this.usuario.email,
          registroFecha: new Date(),

          fechaRegistro: new Date()
        };

        this.cargando.show();
        this.egresoServicio.crear(nuevoEgreso).then((respuesta: any) => {

          this.snackbar.open('Hey!, registrado con exito...', 'OK', { duration: 10000 });
          this.router.navigate(['/administracion/egresos/detalle/' + respuesta.id]);
          this.cargando.hide();

        });

      }
    });
  }

  desvincularEgreso(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Desvincular Egreso',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: 'Se eliminara los registros del Detalle de Egreso, pero seguira activo el egreso'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();

        this.egresoServicio.editar(fila.id, { ordenId: null, ordenCodigo: null, usuarioDesvinculador: this.usuario.email }).then(res => {
          this.egresoDetalleServicio.eliminarPorEgreso(fila.id).then(respuesta => {
            this.snackbar.open('Hey!, egreso desvinculado con exito...', 'OK', { duration: 10000 });
            this.cargando.hide();
            this.obtenerOrden();
          })
        });

      }
    });
  }

  cargar(idOrden: any) {
    console.log('ID ORDEN: ', idOrden);
    this.router.navigate(['/administracion/ordenes/temporal/' + idOrden]);
  }


  ajustar(egreso: any) {
    console.log('EGRESO A REVISAR: ', egreso);
    this.cargando.show('Revisando detalles del egreso...');
    this.egresoDetalleServicio.obtenerPorEgreso(egreso.id).then(respuesta => {

      respuesta.forEach((detalle: any) => {
        console.log('DETALLE A REVISAR: ', detalle);
        this.egresoDetalleServicio.editar(detalle.id, {
          ordenId: egreso.ordenId,
          ordenCodigo: egreso.ordenCodigo,

          vehiculoId: egreso.vehiculoId,
          vehiculoInterno: egreso.vehiculoInterno,
          vehiculoPlaca: egreso.vehiculoPlaca,
          vehiculoEmpresa: egreso.vehiculoEmpresa,

          mantenimientoTipo: egreso.mantenimientoTipo,
          mantenimientoDescripcion: egreso.mantenimientoDescripcion,
        }).then(res => {
          this.snackbar.open('Hey!, detalle revisado con exito...', 'OK', { duration: 10000 });
          this.cargando.hide();
        });

      });

    });
  }

  ajustarEmpresa(orden: any) {
    this.cargando.show('Ajustando orden...');
    console.log('ORDEN: ',orden);
    this.vehiculoServicio.obtenerPorId(orden.vehiculoId).then((vehiculo: any) => {
      console.log('VEHICULO: ', vehiculo);
      this.ordenServicio.editar(orden.id, { vehiculoEmpresa: vehiculo.empresa }).then(respuesta => {
        this.cargando.hide();
        this.snackbar.open('Hey!, orden ajustada con exito...', 'OK', { duration: 10000 });
        this.obtenerOrden();
      });
    });
  }
}
