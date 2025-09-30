import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


import { RouterModule } from '@angular/router';
import { AuthService } from '../../../servicios/auth.service';

import { VehiculoService } from '../../../servicios/vehiculo.service';
import { OrdenService } from '../../../servicios/orden.service';
import { ExcelService } from '../../../servicios/excel.service';
import { sucursales } from '../../../datos/sucursales';
import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';
import { CalculoService } from '../../../servicios/calculo.service';


@Component({
  selector: 'app-reporte6',
  templateUrl: './reporte6.component.html',
  styleUrl: './reporte6.component.scss',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    //MatTooltip,

    NgSelectComponent
  ],
})
export class Reporte6Component {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  usuario: any | null = null;

  lista: any[] = [];

  listaExpotacion: any[] = [];
  listaVehiculos: any = [];
  listaSucursales = sucursales;

  fechaHoy = new Date().toISOString().split('T')[0];
  fechaHoyTexto = new Date().toISOString().split('T')[0];

  @ViewChild('tabla') tabla!: ElementRef;

  totales: any = {};

  constructor(
    private fb: FormBuilder,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    private titleService: Title,
    private vehiculoServicio: VehiculoService,
    private edServicio: EgresoDetalleService,
    private excelServicio: ExcelService,
    private calculoServicio: CalculoService,

  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }
    });

    this.buscadorFormGroup = this.fb.group({
      vehiculoId: ['TODOS'],
      // tipo: ['TODOS'],
      //publicado: ['TODOS'],
      //categoria: ['TODOS'],

      fechaInicio: [this.fechaHoy],
      fechaFinal: [this.fechaHoy],

      finalizado: ['true'],

      sucursal: ['TODOS'],

      activo: ['true'],
      limite: [500],
    });
    //this.obtenerConsulta();
    this.establecerSuscripcionForm();

  }

  ngOnInit(): void {
    this.titleService.setTitle('Reporte de Ordenes');
    this.obtenerVehiculos()
  }

  ngAfterViewInit() { }

  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.fechaInicio.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.fechaFinal.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.vehiculoId.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.finalizado.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.sucursal.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
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

  obtenerConsulta(): void {
    this.cargando.show();
    this.edServicio.obtenerConsultaReporte(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {
      console.log('CONSULTA: ', respuesta);

      this.totales = this.calculoServicio.sumarPorColumnas(respuesta);

      const resultadosOrdenados = respuesta.sort((a: any, b: any) => b.fecha - a.fecha);
      this.listaExpotacion = this.transformarDatos(resultadosOrdenados);
      this.lista = resultadosOrdenados;

      this.cargando.hide();
    });
  }

  transformarDatos(lista: any[]): any[] {
    const resultado: any[] = [];

    for (const item of lista) {
      const base = {
        Orden: item.ordenCodigo,
        Egreso: item.egresoCodigo,
        Sucursal: item.sucursal,
        Interno: item.vehiculoInterno,
        Placa: item.vehiculoPlaca,
        Codigo: item.productoCodigo,
        Descripcion: item.productoDescripcion,
        cantidad: item.cantidad,
        PrecioCompra: item.pc,
        PrecioVenta: item.pv,
        SubTotal: item.subtotal,
        fecha: item.fecha,
        registro: item.registroFecha?.toDate().toLocaleString(),
      };
      resultado.push({
        ...base,
        Verificacion: ''
      });

    }

    return resultado;
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
                        <title>InventarioFisico-`+ this.b.sucursal.value + '-' + this.fechaHoyTexto + `</title>
                        <style>
                        .no-imprimir {
                          display: none;
                        }
                        .tabla-estilizada {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 5px 0;
                            font-size: 0.875rem;
                            font-family: Arial, sans-serif;
                            background-color: #f8f9fa;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            border-radius: 4px;
                            overflow: hidden;
                        }

                        /* Encabezado de la tabla */
                        .tabla-estilizada thead {
                            background-color: #11cc0b;
                            color: #fff;
                            text-align: left;
                        }

                        .tabla-estilizada th {
                            padding: 2px;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.03em;
                        }

                        /* Cuerpo de la tabla */
                        .tabla-estilizada td {
                            padding: 2px;
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

  // A EXCEL
  exportarJson(): void {
    this.excelServicio.exportarAExcel(this.listaExpotacion, 'Ordenes-');
  }
}
