import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

// ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ProductoService } from '../../../servicios/producto.service';
import { limites } from '../../../datos/limites';
import { Title } from '@angular/platform-browser';
import { sucursales } from '../../../datos/sucursales';
import { ExcelService } from '../../../servicios/excel.service';

@Component({
  selector: 'app-reporte1',
  templateUrl: './reporte1.component.html',
  styleUrl: './reporte1.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule
  ],
})
export class Reporte1Component {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  lista: any[] = [];
  listaExpotacion: any[] = [];

  fechaHoyTexto = new Date().toISOString().split('T')[0];
  fechaHoy = new Date();

  totales: any;

  totalDineroPorFecha: any[] = [];

  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];
  limites = limites;

  @ViewChild('tabla') tabla!: ElementRef;

  listaSucursales = sucursales;

  constructor(
    private fb: FormBuilder,
    private cargando: SpinnerService,
    private productoServicio: ProductoService,
    private titleService: Title,
    private excelServicio: ExcelService,
  ) {
    this.buscadorFormGroup = this.fb.group({
      sucursal: ['TODOS'],
      tipo: ['TODOS'],
      publicado: ['TODOS'],
      limite: [500],
    });
    this.establecerSuscripcionForm();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Reporte 1');
  }

  // FORM
  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.sucursal.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.tipo.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.publicado.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.limite.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
  }

  obtenerConsulta(): void {
    this.cargando.show();
    this.productoServicio.obtenerConsultaConSaldoReporte(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {
      console.log('CONSULTA CON SALDO: ', respuesta);
      // this.dataSource.data = respuesta;
      this.lista = respuesta;
      this.listaExpotacion = this.transformarDatos(respuesta);
      this.cargando.hide();
    });
  }

  sumarPorColumnas(datos: any[]): { [key: string]: number } {
    const sumas: { [key: string]: number } = {};

    datos.forEach(item => {
      Object.keys(item).forEach(key => {
        const valor = item[key];

        if (typeof valor === 'number') {
          if (!sumas[key]) {
            sumas[key] = 0;  // Inicializar la suma para esta columna si es la primera vez que se ve
          }

          sumas[key] += valor;  // Sumar el valor a la suma acumulada de esta columna
        }
      });
    });
    Object.keys(sumas).forEach(key => {
      sumas[key] = parseFloat(sumas[key].toFixed(2));
    });

    return sumas;  // Devolver un objeto con la suma de cada columna
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


  transformarDatos(lista: any[]): any[] {
    const resultado: any[] = [];
    const sucursal = this.b.sucursal.value;

    for (const item of lista) {
      const saldo = Number(item?.cantidadSaldoTotal ?? 0);

      const base = {
        Sucursal: sucursal,
        Codigo: item?.codigo ?? '',
        Descripcion: item?.descripcion ?? '',
        Minimo: item?.minimo ?? 0,
        Saldo: saldo,
      };

      resultado.push({
        ...base,
        InventarioFisico: ''
      });
    }

    return resultado;
  }

  // A EXCEL
  exportarJsonAExcel(): void {
    this.excelServicio.exportarAExcel(this.listaExpotacion, 'Inventario-');
  }

  // A EXCEL
  exportarJson(): void {
    this.excelServicio.exportarAExcel(this.listaExpotacion, 'Inventario-');
  }
}
