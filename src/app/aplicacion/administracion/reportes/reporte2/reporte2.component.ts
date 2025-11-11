import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectComponent } from '@ng-select/ng-select';

// ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { limites } from '../../../datos/limites';
import { Title } from '@angular/platform-browser';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { sucursales } from '../../../datos/sucursales';
import { VehiculoService } from '../../../servicios/vehiculo.service';
import { ProductoService } from '../../../servicios/producto.service';
import { tiposEgresos, tiposIngresos } from '../../../modelos/tipos';
import { CalculoService } from '../../../servicios/calculo.service';


@Component({
  selector: 'app-reporte2',
  templateUrl: './reporte2.component.html',
  styleUrl: './reporte2.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,

    NgSelectComponent,

    // MATERIAL
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule
  ],
})
export class Reporte2Component {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;
  lista: any;

  fechaHoy = new Date().toISOString().split('T')[0];

  totales: any;

  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];
  limites = limites;

  @ViewChild('tabla') tabla!: ElementRef;

  listaTipos = tiposIngresos;
  listaSucursales = sucursales;
  listaVehiculos: any = [];
  listaProductos: any = [];

  constructor(
    private fb: FormBuilder,
    private cargando: SpinnerService,
    private ingresoDetalleServicio: IngresoDetalleService,
    private vehiculoServicio: VehiculoService,
    private productoServicio: ProductoService,
    private calculoServicio: CalculoService,
    private titleService: Title
  ) {
    this.buscadorFormGroup = this.fb.group({

      fechaInicio: [this.fechaHoy],
      fechaFinal: [this.fechaHoy],

      tipo: ['TODOS'],
      sucursal: ['TODOS'],
      producto: ['TODOS'],
      finalizado: ['TODOS'],

    });
    this.establecerSuscripcionForm();
    this.obtenerVehiculos();
    this.cargarProductos();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Reporte 2');
  }

  // FORM
  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.fechaInicio.valueChanges.subscribe((val: any) => {
      this.obtenerReporte();
    });
    this.b.fechaFinal.valueChanges.subscribe((val: any) => {
      this.obtenerReporte();
    });
    this.b.sucursal.valueChanges.subscribe((val: any) => {
      this.obtenerReporte();
    });
    this.b.tipo.valueChanges.subscribe((val: any) => {
      this.obtenerReporte();
    });
    this.b.producto.valueChanges.subscribe((val: any) => {
      this.obtenerReporte();
    });
    this.b.finalizado.valueChanges.subscribe((val: any) => {
      this.obtenerReporte();
    });

  }

  obtenerReporte(): void {
    this.cargando.show();
    this.ingresoDetalleServicio.obtenerReporte(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {
      console.log('CONSULTA CON SALDO: ', respuesta);
      // this.dataSource.data = respuesta;
      this.lista = respuesta;
      this.totales = this.calculoServicio.sumarPorColumnas(respuesta);
      this.cargando.hide();
    });
  }

  obtenerVehiculos(): void {
    this.cargando.show();
    this.vehiculoServicio.obtenerTodosActivos().then(res => {

      this.listaVehiculos = [
        { id: 'TODOS', dato: 'TODOS' },
        ...res.map((res: any) => {
          res.dato = res.interno + ' - ' + res.placa;
          return res;
        })
      ];
      // this.listaVehiculos = res;
      // console.log('VEHICULOS', res);
      this.cargando.hide();
    });
  }

  // Método para agrupar por fecha y sumar el campo totalDinero
  obtenerTotalDineroPorFecha(datos: any[]): any[] {
    const resultado: any = {};

    datos.forEach(item => {
      const fecha = item.fecha;

      // Inicializar el total de dinero para la fecha si no existe
      if (!resultado[fecha]) {
        resultado[fecha] = 0;
      }

      // Sumar el totalDinero de cada registro a la fecha correspondiente
      resultado[fecha] += item.totalDinero;
    });

    // Convertir el objeto resultado en un arreglo de objetos para facilitar el uso en el componente
    return Object.keys(resultado).map(fecha => ({
      fecha,
      totalDinero: resultado[fecha]
    }));
  }

  imprimir() {
    let printContents: any, popupWin: any;
    printContents = this.tabla.nativeElement.outerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

    setTimeout(() => {
      if (popupWin) {
        popupWin.document.open();
        popupWin.document.write(`
                <html>
                    <head>
                        <title>Detalle de Ingresos: `+ this.fechaHoy + `</title>
                        <style>
                        .no-imprimir {
                          display: none;
                        }

                        /* Clase de estilo para una tabla moderna y bonita */
                        .tabla-estilizada {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                            font-size: 0.875rem;
                            font-family: Arial, sans-serif;
                            background-color: #f8f9fa;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            border-radius: 8px;
                            overflow: hidden;
                        }

                        /* Encabezado de la tabla */
                        .tabla-estilizada thead {
                            background-color: #11cc0b;
                            color: #fff;
                            text-align: left;
                        }

                        .tabla-estilizada th {
                            padding: 15px;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.03em;
                        }

                        /* Cuerpo de la tabla */
                        .tabla-estilizada td {
                            padding: 15px;
                            color: #333;
                        }

                        /* Filas alternas */
                        .tabla-estilizada tbody tr:nth-child(odd) {
                            background-color: #e9ecef;
                        }

                        /* Filas al pasar el ratón */
                        .tabla-estilizada tbody tr:hover {
                            background-color: #d6e4f0;
                            cursor: pointer;
                        }

                        /* Bordes de la tabla */
                        .tabla-estilizada th,
                        .tabla-estilizada td {
                            border-bottom: 1px solid #dee2e6;
                        }

                        /* Última fila sin borde */
                        .tabla-estilizada tbody tr:last-child td {
                            border-bottom: none;
                        }
                      
                        </style>
                    </head>
                    <body onload="window.print();window.close()">${printContents}</body>
                </html>`
        );
        popupWin.document.close();
      }
    }, 0);
  }


  cargarProductos() {
    try {
      const raw = localStorage.getItem('listaProductos');
      if (raw) {
        const lista = JSON.parse(raw);
        if (Array.isArray(lista)) {

          this.listaProductos = [{ id: 'TODOS', dato: 'TODOS' }, ...lista];
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

      const productoLista = (respuesta || [])
        .sort((a, b) => (a?.descripcion || '').localeCompare(b?.descripcion || ''))
        .map(producto => ({
          ...producto,
          dato: `${producto.codigo} - ${producto.descripcion}`
        }));

      this.listaProductos = [{ id: 'TODOS', dato: 'TODOS' }, ...productoLista];

      try {
        localStorage.setItem('listaProductos', JSON.stringify(productoLista));
      } catch (e) {
        console.warn('No se pudo guardar listaProductos en localStorage:', e);
      }

      this.cargando.hide();
    }).catch(error => {
      console.error('Error al obtener productos:', error);
    });
  }
}
