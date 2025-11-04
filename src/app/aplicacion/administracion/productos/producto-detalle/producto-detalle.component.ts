import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../servicios/auth.service';
import { ProductoService } from '../../../servicios/producto.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { ProductoFotosComponent } from '../producto-fotos/producto-fotos.component';
import { ProductoEditorComponent } from '../producto-editor/producto-editor.component';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { ArchivoSeleccionarComponent } from '../../archivos/archivo-seleccionar/archivo-seleccionar.component';
import { KardexService } from '../../../servicios/karex.service';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';

@Component({
  selector: 'app-producto-detalle',
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule,

    // MATERIAL
    MatIconModule,
    MatButtonModule,
  ],
})
export class ProductoDetalleComponent {

  idProducto: any;
  producto: any;

  fotos: any[] = [];
  fotoSeleccionado: any = null;


  listaKardexLaPaz: any[] = [];
  listaKardexSantaCruz: any[] = [];
  listaKardexCochabamba: any[] = [];


  listaIngresosLaPaz: any[] = [];
  listaIngresosSantaCruz: any[] = [];
  listaIngresosCochabamba: any[] = [];


  listaEgresosLaPaz: any[] = [];
  listaEgresosSantaCruz: any[] = [];
  listaEgresosCochabamba: any[] = [];

  listaEgresos: any[] = [];
  listaIngresos: any[] = [];

  constructor(
    private ruta: ActivatedRoute,
    private auth: AuthService,
    private pServicio: ProductoService,
    private kardexServicio: KardexService,
    private ingresoDetalleServicio: IngresoDetalleService,
    private egresoDetalleServicio: EgresoDetalleService,

    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    public router: Router,
    private sanitizer: DomSanitizer,
    private titleService: Title) {
    this.idProducto = this.ruta.snapshot.paramMap.get('id');

    //console.log('PROYECTO: ', this.idProyecto);
    //console.log('MATRIZ: ', this.idMatriz);
  }

  ngOnInit() {
    this.obtenerProducto();

  }

  obtenerProducto() {
    this.cargando.show('Cargando Producto…');
    this.pServicio.obtenerPorId(this.idProducto).then((res: any) => {
      this.cargando.hide();
      this.producto = res;
      console.log('PRODUCTO: ', this.producto);

      this.titleService.setTitle(this.producto.descripcion);

      this.fotos = Array.isArray(res?.fotosUrl) ? res.fotosUrl : [];

      if (this.fotos && this.fotos.length > 0) {
        this.fotoSeleccionado = this.fotos[0];
      }

      this.obtenerKardex();
      this.obtenerIngresos();
      this.obtenerEgresos();
      this.obtenerIngresosPorProducto();
      this.obtenerEgresosPorProducto();
    });
  }

  editar() {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: this.idProducto,
        objeto: this.producto,
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProducto();
      }
    });
  }

  editor() {
    const dialogRef = this.dialog.open(ProductoEditorComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: this.idProducto,
        objeto: this.producto,
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProducto();
      }
    });
  }

  cargarFotos() {
    const dialogRef = this.dialog.open(ProductoFotosComponent, {
      width: '600px',
      data: {
        nuevo: false,
        id: this.idProducto,
        objeto: this.producto
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProducto();
      }
    });
  }


  seleccionarImagen(item: any): void {
    this.fotoSeleccionado = item;
  }

  // SELECCIONAR ARCHIVO
  seleccionarArchivo(): void {
    const dialogRef = this.dialog.open(ArchivoSeleccionarComponent, {
      width: '80%',
      data: {
        nuevo: true,
        objeto: null,
        clase: 'TODOS'
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('ARCHIVO SELECCIONADO: ', result);
      if (result) {
        this.pServicio.editar(this.idProducto, { fichaTecnica: result.url }).then(result => {
          this.snackbar.open('Hey!, Ficha Tecnica cargada...', 'OK', { duration: 10000 });
          this.obtenerProducto();
        })
      }
    });
  }

  async obtenerKardex(): Promise<void> {
    this.cargando.show('Cargando Kardex…');
    try {
      const ciudades = ['LA PAZ', 'SANTA CRUZ', 'COCHABAMBA'] as const;

      // 1) Traer todo en paralelo
      const [lp, sc, cb] = await Promise.all(
        ciudades.map(c => this.kardexServicio.obtenerPorProducto(c, this.idProducto))
      );

      // 2) Procesador reutilizable
      const procesar = (items: any[] = []) => {
        let acc = 0;
        return items
          .slice()
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .map((i) => {
            const cant = Number(i.cantidad) || 0;
            const signo = i.tipo === 'INGRESO' ? 1 : i.tipo === 'EGRESO' ? -1 : 0;
            acc += signo * cant;
            return { ...i, cantidadAcumulada: acc };
          });
      };

      // 3) Asignar
      this.listaKardexLaPaz = procesar(lp);
      this.listaKardexSantaCruz = procesar(sc);
      this.listaKardexCochabamba = procesar(cb);
    } catch (err) {
      console.error(err);
      // this.snackBar?.open('Ocurrió un error al cargar el Kardex', 'Cerrar', { duration: 4000 });
    } finally {
      this.cargando.hide();
    }
  }


  // Método para sanitizar HTML
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  async obtenerIngresos(): Promise<void> {
    this.cargando.show('Obteniendo Ingresos...');
    try {
      const sucursales = ['LA PAZ', 'SANTA CRUZ', 'COCHABAMBA'] as const;

      // 1) Traer todo en paralelo
      const [lp, sc, cb] = await Promise.all(
        sucursales.map(c => this.ingresoDetalleServicio.obtenerPorSucuraslYProducto(c, this.idProducto))
      );

      // 2) Procesador reutilizable
      const procesar = (items: any[] = []) => {
        let acc = 0;
        return items
          .slice()
        /*         .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                .map((i) => {
                  const cant = Number(i.cantidad) || 0;
                  const signo = i.tipo === 'INGRESO' ? 1 : i.tipo === 'EGRESO' ? -1 : 0;
                  acc += signo * cant;
                  return { ...i, cantidadAcumulada: acc };
                }); */
      };

      // 3) Asignar
      this.listaIngresosLaPaz = procesar(lp);
      this.listaIngresosSantaCruz = procesar(sc);
      this.listaIngresosCochabamba = procesar(cb);
    } catch (err) {
      console.error(err);
      // this.snackBar?.open('Ocurrió un error al cargar el Kardex', 'Cerrar', { duration: 4000 });
    } finally {
      this.cargando.hide();
    }
  }

  async obtenerEgresos(): Promise<void> {
    this.cargando.show('Obteniendo Egresos...');
    try {
      const sucursales = ['LA PAZ', 'SANTA CRUZ', 'COCHABAMBA'] as const;

      // 1) Traer todo en paralelo
      const [lp, sc, cb] = await Promise.all(
        sucursales.map(c => this.egresoDetalleServicio.obtenerPorSucuraslYProducto(c, this.idProducto))
      );

      // 2) Procesador reutilizable
      const procesar = (items: any[] = []) => {
        let acc = 0;
        return items
          .slice()
        /*         .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                .map((i) => {
                  const cant = Number(i.cantidad) || 0;
                  const signo = i.tipo === 'INGRESO' ? 1 : i.tipo === 'EGRESO' ? -1 : 0;
                  acc += signo * cant;
                  return { ...i, cantidadAcumulada: acc };
                }); */
      };

      // 3) Asignar
      this.listaEgresosLaPaz = procesar(lp);
      this.listaEgresosSantaCruz = procesar(sc);
      this.listaEgresosCochabamba = procesar(cb);
    } catch (err) {
      console.error(err);
      // this.snackBar?.open('Ocurrió un error al cargar el Kardex', 'Cerrar', { duration: 4000 });
    } finally {
      this.cargando.hide();
    }
  }

  obtenerIngresosPorProducto(): void {
    this.cargando.show();
    this.ingresoDetalleServicio.obtenerPorProducto(this.idProducto).then((respuesta: any) => {
      this.cargando.hide();
      this.listaIngresos = respuesta;
    });
  }

  obtenerEgresosPorProducto(): void {
    this.cargando.show();
    this.egresoDetalleServicio.obtenerPorProducto(this.idProducto).then((respuesta: any) => {
      this.cargando.hide();
      this.listaEgresos = respuesta;
    });
  }
}
