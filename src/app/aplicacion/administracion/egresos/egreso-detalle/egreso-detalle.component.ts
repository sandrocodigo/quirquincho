import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';

import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

import { EgresoDetalleFormComponent } from '../egreso-detalle-form/egreso-detalle-form.component';
import { ProductoEgresoComponent } from '../../productos/producto-egreso/producto-egreso.component';
import { ProductoFotosComponent } from '../../productos/producto-fotos/producto-fotos.component';

import { AuthService } from '../../../servicios/auth.service';
import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';
import { EgresoService } from '../../../servicios/egreso.service';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { KardexService } from '../../../servicios/karex.service';

import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { MensajeComponent } from '../../../sistema/mensaje/mensaje.component';

import { EgresoImprimirComponent } from '../egreso-imprimir/egreso-imprimir.component';
import { EgresoFormComponent } from '../egreso-form/egreso-form.component';
import { Title } from '@angular/platform-browser';
import { ProductoService } from '../../../servicios/producto.service';
import { ProductoVentaComponent } from '../../productos/producto-venta/producto-venta.component';
import { CalculoService } from '../../../servicios/calculo.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { EgresoTraspasoComponent } from '../egreso-traspaso/egreso-traspaso.component';
import { EgresoImprimirTraspaso } from '../egreso-imprimir-traspaso/egreso-imprimir-traspaso';

@Component({
  selector: 'app-egreso-detalle',
  templateUrl: './egreso-detalle.component.html',
  styleUrls: ['./egreso-detalle.component.scss'],
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
    MatBottomSheetModule,

    NgSelectModule,
    MatSlideToggleModule,
  ],
})
export class EgresoDetalleComponent {
  idEgreso: any;
  egreso: any;

  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  productoFormGroup: FormGroup;
  productoControl = false;

  detalle: any = [];

  total = 0;
  descuento = 0;
  nuevoTotal = 0;
  itbms = 0;
  totalGeneral = 0;

  usuario: any | null = null;

  listaProductos: any = [];


  listaFavoritos: any = [];

  @ViewChild('aForm') aForm!: ElementRef;
  @ViewChild('aFormSeleccionar') aFormSeleccionar!: ElementRef;

  imprimirAutomatico = false;

  qr: boolean = false;
  parraLlevar: boolean = false;

  @ViewChild('productoSelect', { static: false }) productoSelect!: NgSelectComponent;

  constructor(
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    public authServicio: AuthService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    public router: Router,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private titleService: Title,
    private egresoServicio: EgresoService,
    private egresoDetalleServicio: EgresoDetalleService,
    private ingresoDetalleServicio: IngresoDetalleService,
    private productoServicio: ProductoService,
    private kardexServicio: KardexService,
    private calculoServicio: CalculoService,
  ) {
    this.idEgreso = this.ruta.snapshot.paramMap.get('id');

    this.buscadorFormGroup = this.fb.group({
      codigoBarra: [null],
      idEgreso: [this.idEgreso],
    });

    this.productoFormGroup = this.fb.group({
      productoId: [null],
    });

    this.establecerSuscripcionProducto();

    this.authServicio.user$.subscribe((user) => {
      this.usuario = user;
      // console.log('USUARIO_EMAIL: ', this.usuario.email);
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Egreso-Detalle');
    this.obtenerEgreso();
    this.obtenerEgresoDetalle();
    // this.obtenerCategorias();
  }

  get b(): any { return this.buscadorFormGroup.controls; }
  get p(): any { return this.productoFormGroup.controls; }

  establecerSuscripcionProducto() {
    this.p.productoId.valueChanges.subscribe((val: any) => {
      if (this.p.productoId.value) {
        this.obtenerDatosProducto();
      }
    });
  }

  obtenerDatosProducto() {
    const id = this.p.productoId.value;
    const productoEncontrado = this.listaProductos.find((producto: any) => producto.id === id);
    console.log('PRODUCTO ENCONTRADO: ', productoEncontrado);
    if (productoEncontrado) {
      this.adicionar(productoEncontrado);
    }
  }

  obtenerEgreso() {
    this.egresoServicio.obtenerPorId(this.idEgreso).then(res => {
      console.log('EGRESO: ', res);
      this.egreso = res;
      this.qr = this.egreso.qr;
      this.parraLlevar = this.egreso.paraLlevar;
      this.titleService.setTitle('Egreso: ' + this.egreso.codigo);
      if (!res.finalizado) {
        this.cargarProductos();
        // this.focus();
        this.focusSeleccinar();
        console.log('FOCUS EN SELECCIONAR PRODUCTO: ????? ', res);
      }
    });
  }

  obtenerEgreso2() {
    this.cargando.show('Recargando egreso...');
    this.egresoServicio.obtenerPorId(this.idEgreso).then(res => {
      console.log('EGRESO 2: ', res);
      this.egreso = res;
      this.qr = this.egreso.qr;
      this.parraLlevar = this.egreso.paraLlevar;
      this.cargando.hide();
    });
  }

  obtenerEgresoDetalle(): void {
    this.cargando.show('Cargando detalle...');
    this.egresoDetalleServicio.obtenerPorEgreso(this.idEgreso)
      .then(respuesta => {
        this.detalle = respuesta;
        console.log('EGRESO DETALLE: ', this.detalle);
        this.imprimirAutomatico = this.contieneProductoTipoComida(this.detalle);
        this.calcularTodo();
      })
      .catch(err => {
        console.error('obtenerEgresoDetalle error', err);
        this.snackbar.open('Error al cargar el detalle', 'OK', { duration: 3000 });
      })
      .finally(() => this.cargando.hide());
  }

  contieneProductoTipoComida(array: any[]): boolean {
    return array.some(item => item.productoTipo === 'COMIDA');
  }

  cargarProductos() {
    try {
      const raw = localStorage.getItem('listaProductos');
      if (raw) {
        const lista = JSON.parse(raw);
        if (Array.isArray(lista)) {
          this.listaProductos = lista;
          this.tryFocusNgSelect();
          return; // listo: cargado desde cache
        }
      }
    } catch (e) {
      console.warn('No se pudo leer listaProductos del localStorage:', e);
    }
    // si no hay cache válido, traer del servidor
    this.obtenerProductos();
  }

  obtenerProductos() {
    console.log('CARGANDO PRODUCTOS DESDE SERVIDOR...');
    this.cargando.show('Cargando productos desde el Servidor...');
    this.productoServicio.obtenerConsulta({
      tipo: 'TODOS',
      activo: 'true',
      publicado: 'TODOS',
      categoria: 'TODOS',
      limite: 1000
    }).then((respuesta: any[]) => {

      this.listaFavoritos = this.buscarCoincidenciasEnLista(respuesta, 'favorito', true);

      // console.log('PRODUCTOS RAPIDOS: ', this.listaRapidos);


      const productoLista = (respuesta || [])
        .sort((a, b) => (a?.descripcion || '').localeCompare(b?.descripcion || ''))
        .map(producto => ({
          ...producto,
          dato: `${producto.codigo} - ${producto.descripcion}`
        }));

      this.listaProductos = productoLista; // <- asigna a la lista del componente

      try {
        localStorage.setItem('listaProductos', JSON.stringify(productoLista));
      } catch (e) {
        console.warn('No se pudo guardar listaProductos en localStorage:', e);
      }

      // this.focusSeleccinar();
      this.tryFocusNgSelect();
      this.cargando.hide();
    }).catch(error => {
      console.error('Error al obtener productos:', error);
    });
  }

  egresarConCodigoDeBarra(): void {
    if (this.b.codigoBarra.value) {
      const barraBuscar = this.b.codigoBarra.value;
      const productoEncontrado = this.listaProductos.find((producto: any) => producto.codigoBarra === barraBuscar);
      if (productoEncontrado) {
        this.adicionar(productoEncontrado);
      } else {
        this.cargando.hide();
        this.snackbar.open('PRODUCTO NO ENCONTRADO...', 'OK', { duration: 1000 });
      }
    }
  }

  buscarProducto(): void {
    const dialogRef = this.dialog.open(ProductoEgresoComponent, {
      width: '800px',
      data: {
        nuevo: true,
        idEgreso: this.idEgreso,
        egreso: this.egreso,
        detalle: this.detalle,
        objeto: null
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerEgreso();
        this.obtenerEgresoDetalle();
      }
    });
  }

  seleccionarProducto(): void {
    const dialogRef = this.dialog.open(ProductoVentaComponent, {
      width: '800px',
      data: {
        nuevo: true,
        idEgreso: this.idEgreso,
        egreso: this.egreso,
        detalle: this.detalle,
        objeto: null
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        console.log('producto: ', result);
        // this.obtenerEgreso();
        // this.obtenerEgresoDetalle();
      }
    });
  }

  editar(fila: any) {
    const dialogRef = this.dialog.open(EgresoDetalleFormComponent, {
      width: '600px',
      data: {
        nuevo: true,
        idEgreso: this.idEgreso,
        egreso: this.egreso,
        id: fila.id,
        objeto: fila
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerEgreso();
        this.obtenerEgresoDetalle();
      }
    });
  }

  eliminar(fila: any) {
    this.cargando.show('Eliminando...');
    this.egresoDetalleServicio.eliminar(fila.id).then(res => {
      this.cargando.hide();
      this.snackbar.open('Eliminado...', 'OK', { duration: 1000 });
      this.obtenerEgresoDetalle();
    });
  }

  calcularTotal() {
    let total = 0;
    this.detalle.forEach((item: any) => {
      total += item.subtotal;
    });
    return total;
  }

  calcularTodo() {
    this.total = this.calcularTotal();
    this.descuento = (this.total * this.egreso.porcentajeDescuento) / 100;
    this.nuevoTotal = this.total - this.descuento;
    this.itbms = (this.nuevoTotal * this.egreso.porcentajeImpuesto) / 100;
    this.totalGeneral = this.nuevoTotal + this.itbms;
  }

  sumar(fila: any) {
    if (fila.cantidad >= fila.cantidadSaldo) return;
    const cantidadNuevo = fila.cantidad + 1;
    const subtotal = cantidadNuevo * fila.pv;
    this.cargando.show('Adicionando...');
    this.egresoDetalleServicio.editar(fila.id, {
      cantidad: cantidadNuevo,
      subtotal,
    }).then(() => {
      this.cargando.hide();
      this.obtenerEgresoDetalle();
      this.snackbar.open('Adicionado! [+1]', 'OK', { duration: 1000 });
    });
  }

  restar(fila: any) {
    if (fila.cantidad <= 1) return;
    const cantidadNuevo = fila.cantidad - 1;
    const subtotal = cantidadNuevo * fila.pv;
    this.cargando.show('Restando...');
    this.egresoDetalleServicio.editar(fila.id, {
      cantidad: cantidadNuevo,
      subtotal,
    }).then(() => {
      this.cargando.hide();
      this.obtenerEgresoDetalle();
      this.snackbar.open('Eliminado! [-1]', 'OK', { duration: 1000 });
    });
  }

  fotos(fila: any) {
    const dialogRef = this.dialog.open(ProductoFotosComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: fila.id,
        objeto: fila
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  async finalizar() {
    const fechaRegistro = new Date();
    const fechaAprobacion = new Date().toISOString().split('T')[0];

    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Finalizar Egreso',
        mensaje: '¿Está seguro de realizar esta acción?',
      },
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          this.cargando.show('Finalizando...');

          // Procesar cada detalle de venta
          for (const item of this.detalle) {
            console.log(`Procesando producto: ${item.productoDescripcion}`);

            // Obtener registros de ingresoDetalle relacionados con el producto
            const res = await this.ingresoDetalleServicio.obtenerPorIdProducto(this.egreso.sucursal, item.productoId);
            const totales: any = this.calculoServicio.sumarPorColumnas(res);
            const cantidadSaldo = totales.cantidadSaldo;
            const cantidadParcial = cantidadSaldo - item.cantidad;

            if (!res.length) {
              item.observado = true; // Marcar como observado si no hay registros
              await this.egresoDetalleServicio.editar(item.id, { observado: true });
              throw new Error(`No se encontraron registros para el producto: ${item.productoDescripcion}`);
            }

            let cantidadPendiente = item.cantidad;
            let observado = false;

            // Recorrer los registros de ingresoDetalle en orden
            for (const ingresoDetalle of res) {
              if (cantidadPendiente <= 0) break;

              const disponible = ingresoDetalle.cantidadSaldo;
              const aDescontar = Math.min(disponible, cantidadPendiente);

              if (aDescontar <= 0) continue; // No hay saldo disponible

              // Actualizar cantidad pendiente y saldo disponible
              const nuevoSaldo = disponible - aDescontar;
              await this.ingresoDetalleServicio.editar(ingresoDetalle.id, { cantidadSaldo: nuevoSaldo, finalizadoFecha: new Date() });

              // Registrar en Kardex
              await this.kardexServicio.crear({
                sucursal: this.egreso.sucursal,
                fecha: fechaAprobacion,
                tipo: 'EGRESO',

                motivo: this.egreso.tipo,
                codigo: this.egreso.codigo,
                codigoId: this.idEgreso,

                productoId: item.productoId,
                productoCodigo: item.productoCodigo,
                productoDescripcion: item.productoDescripcion,

                cantidad: aDescontar,
                cantidadParcial: cantidadParcial,

                usuario: this.usuario.email,
                fechaRegistro: fechaRegistro,

                // Control
                registroFecha: new Date(),
                registroUsuario: this.usuario.email,

              });

              // PRODUCTO
              await this.productoServicio.editar(item.productoId, {
                cantidadTotal: cantidadParcial,
              })

              cantidadPendiente -= aDescontar;
            }

            // Si queda cantidad pendiente, marcar como observado
            if (cantidadPendiente > 0) {
              observado = true;
              console.warn(`Saldo insuficiente para completar la venta de: ${item.productoDescripcion}`);
            }

            // Actualizar estado del detalle
            await this.egresoDetalleServicio.editar(item.id, {
              fecha: fechaAprobacion,
              finalizado: true,
              finalizadoUsuario: this.usuario.email,
              finalizadoFecha: new Date(),
              observado: observado,
            });
          }

          // Actualizar el egreso
          await this.egresoServicio.editar(this.idEgreso, {
            fecha: fechaAprobacion,
            total: Number(this.total.toFixed(2)),
            descuento: Number(this.descuento.toFixed(2)),
            nuevoTotal: Number(this.nuevoTotal.toFixed(2)),
            itbms: Number(this.itbms.toFixed(2)),
            totalGeneral: Number(this.totalGeneral.toFixed(2)),
            finalizado: true,
            finalizadoFecha: new Date(),
            finalizadoUsuario: this.usuario.email
          });

          if (this.imprimirAutomatico) {
            // this.imprime();
          }
          this.obtenerEgreso();
          this.snackbar.open('Finalización exitosa', 'OK', { duration: 10000 });
        } catch (error: any) {
          console.error('Error durante la Finalización:', error);
          this.snackbar.open(`Error en la finalización: ${error.message}`, 'OK', { duration: 10000 });
        } finally {
          this.cargando.hide();
        }
      }
    });
  }


  nuevaVenta(): void {
    const dialogRef = this.dialog.open(EgresoFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // console.log('RESULTADO: ',result.id);
        this.router.navigate(['/administracion/egresos/nuevo/' + result.id]);
        // this.obtenerConsulta();
      }
    });
  }

  editarEgreso(): void {
    const dialogRef = this.dialog.open(EgresoFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: this.idEgreso,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerEgreso();
        this.obtenerEgresoDetalle();
      }
    });
  }

  adicionar(producto: any) {

    const fechaRegistro = new Date();
    const fecha = new Date().toISOString().split('T')[0];

    const detallePediente = this.buscarEnLaLista(this.detalle, "productoId", producto.id);
    if (detallePediente) {
      //console.log('DETALLE PENDIENTE: ', detallePediente);
      this.sumar(detallePediente);
      if (this.b.codigoBarra.value !== null) { this.b.codigoBarra.setValue(null); }
      if (this.p.productoId.value !== null) { this.p.productoId.setValue(null); }

    } else {
      this.cargando.show('Obteniendo detalle de ingresos...');
      this.ingresoDetalleServicio.obtenerPorIdProducto(this.egreso.sucursal, producto.id).then(res => {
        this.cargando.hide();
        console.log('DETALLE DE INGRESOS ENCONTRADOS: ', res);

        if (res.length > 0) {
          // const ingresoDetalle = res[0];
          const registros = res.length;
          const totales: any = this.calculoServicio.sumarPorColumnas(res);

          const cantidadSaldo = totales.cantidadSaldo;
          const precioCompra = totales.pc / registros;
          const precioVenta = totales.pv / registros;

          console.log('REGISTROS: ', res.length);
          console.log('CANTIDAD SALDO: ', cantidadSaldo);
          console.log('PC: ', precioCompra);
          console.log('PV: ', precioVenta);

          this.cargando.show('Creando...');
          this.egresoDetalleServicio.crear({

            fecha: fecha,

            egresoId: this.idEgreso,
            egresoCodigo: this.egreso.codigo,
            egresoDescripcion: this.egreso.descripcion,
            egresoTipo: this.egreso.tipo,

            sucursal: this.egreso.sucursal,

            //ingresoDetalleId: ingresoDetalle.id,
            //ingresoCantidadSaldo: ingresoDetalle.cantidadSaldo,

            // DETALLE ORDEN Y VEHICULO
            ordenId: this.egreso.ordenId || '',
            ordenCodigo: this.egreso.ordenCodigo || 0,

            vehiculoId: this.egreso.vehiculoId || '',
            vehiculoInterno: this.egreso.vehiculoInterno || '',
            vehiculoPlaca: this.egreso.vehiculoPlaca || '',
            vehiculoEmpresa: this.egreso.vehiculoEmpresa || '',

            mantenimientoTipo: this.egreso.mantenimientoTipo || '',
            mantenimientoDescripcion: this.egreso.mantenimientoDescripcion || '',

            productoId: producto.id,
            productoTipo: producto.tipo,
            productoCodigo: producto.codigo,
            productoDescripcion: producto.descripcion,
            productoCodigoBarra: producto.codigoBarra,
            productoFotosUrl: producto.fotosUrl,

            cantidad: 1,
            cantidadSaldo: cantidadSaldo,
            pc: precioCompra,
            pv: precioVenta,
            subtotal: precioVenta,
            fechaRegistro: fechaRegistro,

            // Control
            registroFecha: new Date(),
            registroUsuario: this.usuario.email,

            finalizado: false,
            observado: false,
          }).then(res => {
            this.cargando.hide();
            console.log('RESPUESTA: ', res);
            this.snackbar.open('Adicionado! [+1] : ' + producto.productoDescripcion, 'OK', { duration: 1000 });
            this.obtenerEgresoDetalle();
            if (this.b.codigoBarra.value !== null) { this.b.codigoBarra.setValue(null); }
            if (this.p.productoId.value !== null) { this.p.productoId.setValue(null); }
          });
        } else {
          this.cargando.hide();
          const dialogRef = this.dialog.open(MensajeComponent, {
            data: {
              titulo: 'SALDO INSUFICIENTE',
              mensaje: 'Se recomienda ingresar mas cantidades de ' + producto.descripcion + ' en Ingresos',
            },
          });

          dialogRef.afterClosed().subscribe(async result => {
            if (result) {
            }
          });
        }
      });

    }
  }

  nuevo() {
    const dialogRef = this.dialog.open(EgresoFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/administracion/egresos/temporal/' + result.id]);
      }
    });
  }

  onSeleccionar() {

  }

  buscarEnLaLista<T>(list: T[], key: keyof T, value: any): T | undefined {
    return list.find(item => item[key] === value);
  }

  buscarCoincidenciasEnLista<T>(list: T[], key: keyof T, value: any): T[] {
    return list.filter(item => item[key] === value);
  }

  // FOCUS
  focus(): void {
    setTimeout(() => {
      const input = 'codigoBarra';
      const ele = this.aForm.nativeElement[input];
      if (ele) {
        ele.focus();
        ele.select();
      }
    }, 300);
  }

  // FOCUS SELECCIONAR
  focusSeleccinar(): void {
    setTimeout(() => {
      const input = 'productoId';
      const ele = this.aFormSeleccionar.nativeElement[input];
      if (ele) {
        ele.focus();
        ele.select();
      }
    }, 300);
  }

  onQrChange(event: any): void {
    const isChecked = event.checked;
    console.log('¿Pagará con QR?:', isChecked);
    this.cargando.show('Cambiando estado QR...');
    this.egresoServicio.editar(this.idEgreso, { qr: isChecked }).then((respuesta: any) => {
      this.snackbar.open('Hey!, actualizacion con exito...', 'OK', { duration: 10000 });
      this.cargando.hide();
      this.obtenerEgreso2();
    });
  }

  onLLevarChange(event: any): void {
    const isChecked = event.checked;
    this.cargando.show('Cambiando estado para llevar...');
    this.egresoServicio.editar(this.idEgreso, { paraLlevar: isChecked }).then((respuesta: any) => {
      this.snackbar.open('Hey!, actualizacion con exito...', 'OK', { duration: 10000 });
      this.cargando.hide();
      this.obtenerEgreso2();
    });
  }

  private tryFocusNgSelect(): void {
    // Espera al siguiente tick para que el input interno de ng-select exista,
    // especialmente si usas appendTo="body"
    setTimeout(() => {
      if (this.productoSelect) {
        this.productoSelect.focus(); // mueve el foco al input de búsqueda
        // opcional: abrir el dropdown
        // this.productoSelect.open();
      }
    }, 0);
  }

  editarTraspaso(fila: any): void {
    const dialogRef = this.dialog.open(EgresoTraspasoComponent, {
      width: '800px',
      data: {
        nuevo: false,
        idUsuario: fila.usuarioId,
        id: this.idEgreso,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerEgreso();
      }
    });
  }

  imprimir() {
    const dialogRef = this.dialog.open(EgresoImprimirComponent, {
      width: '400px',
      data: {
        id: this.idEgreso,
        egreso: this.egreso,
        detalle: this.detalle,
        total: this.totalGeneral
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // this.obtenerEgreso();
        // this.obtenerEgresoDetalle();
      }
    });
  }

  imprimirTraspaso() {
    const dialogRef = this.dialog.open(EgresoImprimirTraspaso, {
      width: '400px',
      data: {
        id: this.idEgreso,
        egreso: this.egreso,
        detalle: this.detalle,
        total: this.totalGeneral
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // this.obtenerEgreso();
        // this.obtenerEgresoDetalle();
      }
    });
  }

}
