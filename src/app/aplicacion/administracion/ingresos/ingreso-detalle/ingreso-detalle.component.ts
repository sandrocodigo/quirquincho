import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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


import { ProductoIngresoComponent } from '../../productos/producto-ingreso/producto-ingreso.component';
import { IngresoDetalleFormComponent } from '../ingreso-detalle-form/ingreso-detalle-form.component';

import { ProductoFotosComponent } from '../../productos/producto-fotos/producto-fotos.component';
import { AuthService } from '../../../servicios/auth.service';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { IngresoService } from '../../../servicios/ingreso.service';
import { KardexService } from '../../../servicios/karex.service';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { Title } from '@angular/platform-browser';
import { IngresoImprimirComponent } from '../ingreso-imprimir/ingreso-imprimir.component';
import { ProductoService } from '../../../servicios/producto.service';
import { CalculoService } from '../../../servicios/calculo.service';
import { IngresoFormComponent } from '../ingreso-form/ingreso-form.component';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-ingreso-detalle',
  templateUrl: './ingreso-detalle.component.html',
  styleUrls: ['./ingreso-detalle.component.scss'],
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

    NgSelectModule

  ],
})
export class IngresoDetalleComponent {
  idIngreso: any;
  ingreso: any;

  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  productoFormGroup: FormGroup;
  productoControl = false;

  detalle: any;
  total: any = 0;

  listaProductos: any = [];

  usuario: any | null = null;
  @ViewChild('productoSelect', { static: false }) productoSelect!: NgSelectComponent;

  constructor(
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    public authServicio: AuthService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    public router: Router,
    private dialog: MatDialog,
    private ingresoServicio: IngresoService,
    private ingresoDetalleServicio: IngresoDetalleService,
    private kardexServicio: KardexService,
    private titleService: Title,
    private productoServicio: ProductoService,
    private calculoServicio: CalculoService
  ) {
    this.idIngreso = this.ruta.snapshot.paramMap.get('id');
    this.buscadorFormGroup = this.fb.group({
      codigoBarra: [''],
      idIngreso: [this.idIngreso],
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
    this.obtenerIngreso();
    this.obtenerIngresoDetalle();
  }

  get b(): any { return this.buscadorFormGroup.controls; }
  get p(): any { return this.productoFormGroup.controls; }

  establecerSuscripcionProducto() {
    this.p.productoId.valueChanges.subscribe((val: any) => {
      if (this.p.productoId.value) {
        this.obtenerDatosProducto();
      }
      //console.log('PRODUCTO SELECCIONADO: ' + val);
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

  obtenerIngreso() {
    this.cargando.show();
    this.ingresoServicio.obtenerPorId(this.idIngreso).then(res => {
      // console.log('INGRESO: ', res);
      this.ingreso = res;
      this.titleService.setTitle('Ingreso: ' + this.ingreso.codigo);
      if (!res.finalizado) {
        this.cargarProductos();
        // this.focus();
        // this.focusSeleccinar();
      }
      this.cargando.hide();
    });
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

  obtenerIngresoDetalle(): void {
    this.cargando.show();
    this.ingresoDetalleServicio.obtenerPorIngreso(this.idIngreso).then(respuesta => {
      console.log('DETALLE: ', respuesta);
      this.detalle = respuesta;
      this.total = this.calcularTotal();
      this.cargando.hide();
    });
  }

  obtenerProductos() {
    this.cargando.show();

    this.productoServicio.obtenerConsulta({
      tipo: 'TODOS',
      activo: 'true',
      publicado: 'TODOS',
      categoria: 'TODOS',
      limite: 2000
    }).then((respuesta: any[]) => {



      this.listaProductos = respuesta
        .sort((a, b) => a.descripcion.localeCompare(b.descripcion)) // ordena por descripción alfabética
        .map(producto => ({
          ...producto,
          dato: `${producto.codigo} - ${producto.descripcion}`
        }));

      this.cargando.hide();
    }).catch(error => {
      console.error('Error al obtener productos:', error);
      this.cargando.hide();
    });
  }

  buscarProducto(): void {
    const dialogRef = this.dialog.open(ProductoIngresoComponent, {
      width: '600px',
      data: {
        nuevo: true,
        idIngreso: this.idIngreso,
        ingreso: this.ingreso,
        objeto: null
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      /*       if (result) {
              this.obtenerIngreso();
              this.obtenerIngresoDetalle();
            } */

      this.obtenerIngreso();
      this.obtenerIngresoDetalle();
    });
  }

  editarIngreso(): void {
    const dialogRef = this.dialog.open(IngresoFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: this.idIngreso,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerIngreso();
        this.obtenerIngresoDetalle();
      }
    });
  }

  editar(fila: any) {
    const dialogRef = this.dialog.open(IngresoDetalleFormComponent, {
      width: '600px',
      data: {
        nuevo: true,
        idIngreso: this.idIngreso,
        ingreso: this.ingreso,
        id: fila.id,
        objeto: fila
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerIngreso();
        this.obtenerIngresoDetalle();
      }
    });
  }

  eliminar(fila: any) {
    this.cargando.show();
    this.ingresoDetalleServicio.eliminar(fila.id).then(res => {
      this.snackbar.open('Eliminado...', 'OK', {
        duration: 1000
      });
      this.obtenerIngresoDetalle();
      this.cargando.hide();
    });
  }

  calcularTotal() {
    let total = 0;
    this.detalle.forEach((item: any) => {
      total += item.subtotal;
    });
    return total.toFixed(2);
  }

  buscarEnLaLista<T>(list: T[], key: keyof T, value: any): T | undefined {
    return list.find(item => item[key] === value);
  }

  ingresarConCodigoDeBarra(): void {
    if (this.b.codigoBarra.value) {
      const barraBuscar = this.b.codigoBarra.value;
      const productoEncontrado = this.listaProductos.find((producto: any) => producto.codigoBarra === barraBuscar);
      if (productoEncontrado) {
        this.adicionar(productoEncontrado);
      } else {
        this.snackbar.open('PRODUCTO NO ENCONTRADO...', 'OK', { duration: 1000 });
      }
    }
  }

  sumar(fila: any) {
    const cantidadNuevo = +fila.cantidad + +1;
    const subtotal = cantidadNuevo * fila.pc;
    this.ingresoDetalleServicio.editar(fila.id, {
      cantidad: cantidadNuevo,
      subtotal: subtotal,
    }).then(respuesta => {
      this.obtenerIngreso();
      this.obtenerIngresoDetalle();
      this.snackbar.open('Adicionado! [+1]', 'OK', {
        duration: 1000
      });
    });
  }

  restar(fila: any) {
    const cantidadNuevo = +fila.cantidad - +1;
    const subtotal = cantidadNuevo * fila.pc;
    this.ingresoDetalleServicio.editar(fila.id, {
      cantidad: cantidadNuevo,
      subtotal: subtotal,
    }).then(respuesta => {
      this.obtenerIngreso();
      this.obtenerIngresoDetalle();
      this.snackbar.open('Adicionado! [+1]', 'OK', {
        duration: 1000
      });
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

  finalizar() {
    const fechaRegistro = new Date();
    const fechaAprobacion = new Date().toISOString().split('T')[0];
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Finalizar Ingreso',
        mensaje: '¿Está seguro de realizar esta acción?',
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          this.cargando.show();

          // Actualizar el ingreso
          await this.ingresoServicio.editar(this.idIngreso, {
            fecha: fechaAprobacion,
            fechaAprobacion: fechaRegistro,
            total: this.total,
            finalizado: true,
          });

          // Actualizaciones de los detalles y Kardex
          const actualizaciones = this.detalle.map(async (item: any) => {
            // Obtener el saldo actual del producto
            const detalles = await this.ingresoDetalleServicio.obtenerPorIdProducto(this.ingreso.sucursal, item.productoId);
            console.log('DETALLE DE INGRESO ENCONTRADO: ', detalles);

            let cantidadSaldo = 0;
            if (detalles.length > 0) {
              const totales: any = this.calculoServicio.sumarPorColumnas(detalles);
              cantidadSaldo = totales.cantidadSaldo;
            }

            // Calcular la cantidad parcial
            const cantidadParcial = +cantidadSaldo + +item.cantidad;

            item.finalizado = true;

            // Realizar las actualizaciones necesarias
            return Promise.all([

              this.ingresoDetalleServicio.editar(item.id, {
                fecha: fechaAprobacion,
                fechaAprobacion: fechaRegistro,
                cantidadSaldo: item.cantidad,
                finalizado: true,
              }),

              // KARDEX
              this.kardexServicio.crear({
                sucursal: this.ingreso.sucursal,
                fecha: fechaAprobacion,
                tipo: 'INGRESO',
                motivo: this.ingreso.tipo,
                codigo: this.ingreso.codigo,
                productoId: item.productoId,
                productoCodigo: item.productoCodigo,
                productoDescripcion: item.productoDescripcion,
                cantidad: item.cantidad,
                cantidadParcial: cantidadParcial,
                usuario: this.usuario.email,
                fechaRegistro: fechaRegistro,
              }),

              // PRODUCTO
              this.productoServicio.editar(item.productoId, {
                cantidadTotal: cantidadParcial,
                pc: item.pc,
                pv: item.pv,
                codigoBarra: item.productoCodigoBarra,
              }),
            ]);
          });

          await Promise.all(actualizaciones);

          this.snackbar.open('Finalización exitosa', 'OK', { duration: 10000 });
          this.obtenerIngreso();
        } catch (error) {
          console.error('Error durante la Finalización:', error);
          this.snackbar.open('Error al Finalizar', 'OK', { duration: 10000 });
        } finally {
          this.cargando.hide();
        }
      }
    });
  }


  imprimir() {
    const dialogRef = this.dialog.open(IngresoImprimirComponent, {
      width: '400px',
      data: {
        id: this.idIngreso,
        egreso: this.ingreso,
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

  // 7771609000205
  adicionar(producto: any) {

    const fechaRegistro = new Date();
    const fecha = new Date().toISOString().split('T')[0];

    this.cargando.show();
    const detallePediente = this.buscarEnLaLista(this.detalle, "productoId", producto.id);
    if (detallePediente) {
      //console.log('DETALLE PENDIENTE: ', detallePediente);
      this.sumar(detallePediente);
      if (this.b.codigoBarra.value !== null) { this.b.codigoBarra.setValue(null); }
      if (this.p.productoId.value !== null) { this.p.productoId.setValue(null); }


    } else {
      // console.log('INGRESAR NUEVO DETALLE: ');

      this.ingresoDetalleServicio.obtenerPorIdProducto(this.ingreso.sucursal, producto.id).then(res => {
        console.log('DETALLE DE INGRESO ENCONTRADO: ', res);

        if (res.length > 0) {
          const registros = res.length;
          const totales: any = this.calculoServicio.sumarPorColumnas(res);

          const cantidadSaldo = totales.cantidadSaldo;
          const precioCompra = totales.pc / registros;
          const precioVenta = totales.pv / registros;

          // Crear con Ingresos Anteriores
          this.ingresoDetalleServicio.crear({
            fecha: fecha,
            sucursal: this.ingreso.sucursal,
            ingreso: this.ingreso,
            ingresoId: this.idIngreso,
            ingresoCodigo: this.ingreso.codigo,
            ingresoDescripcion: this.ingreso.descripcion,

            producto: producto,
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
            subtotal: precioCompra,

            fechaRegistro: fechaRegistro,

            finalizado: false,
            observado: false,
          }).then(res => {
            console.log('RESPUESTA: ', res);
            this.snackbar.open('Adicionado! [+1] : ' + producto.productoDescripcion, 'OK', { duration: 1000 });
            this.cargando.show();
            this.obtenerIngresoDetalle();
            if (this.b.codigoBarra.value !== null) { this.b.codigoBarra.setValue(null); }
            if (this.p.productoId.value !== null) { this.p.productoId.setValue(null); }
          });
        } else {
          // Crear por primera vez
          this.cargando.show();
          this.ingresoDetalleServicio.crear({
            fecha: fecha,
            sucursal: this.ingreso.sucursal,
            ingreso: this.ingreso,
            ingresoId: this.idIngreso,
            ingresoCodigo: this.ingreso.codigo,
            ingresoDescripcion: this.ingreso.descripcion,

            producto: producto,
            productoId: producto.id,
            productoTipo: producto.tipo,
            productoCodigo: producto.codigo,
            productoDescripcion: producto.descripcion,
            productoCodigoBarra: producto.codigoBarra,
            productoFotosUrl: producto.fotosUrl,

            cantidad: 1,
            cantidadSaldo: 0,
            pc: producto.pc || 0,
            pv: producto.pv || 0,
            subtotal: producto.pc || 0,

            fechaRegistro: fechaRegistro,

            finalizado: false,
          }).then(res => {
            console.log('RESPUESTA: ', res);
            this.snackbar.open('Adicionado! [+1] : ' + producto.descripcion, 'OK', { duration: 1000 });
            this.cargando.hide();
            this.obtenerIngresoDetalle();
            if (this.b.codigoBarra.value !== null) { this.b.codigoBarra.setValue(null); }
            if (this.p.productoId.value !== null) { this.p.productoId.setValue(null); }
          });
        }
      });

    }
  }

  onSeleccionar() {

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
}
