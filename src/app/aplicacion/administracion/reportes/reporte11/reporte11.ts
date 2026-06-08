import { Component, ElementRef, ViewChild, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ProductoService } from '../../../servicios/producto.service';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';
import { ExcelService } from '../../../servicios/excel.service';
import { Title } from '@angular/platform-browser';
import { sucursales } from '../../../datos/sucursales';

@Component({
  selector: 'app-reporte11',
  templateUrl: './reporte11.html',
  styleUrl: './reporte11.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,

    // MATERIAL
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule
  ],
})
export class Reporte11 implements OnInit {
  sucursal = signal<string>(''); // Obligatorio seleccionar
  tipo = signal<string>(''); // Obligatorio seleccionar
  publicado = signal<string>('TODOS');
  saldoFiltro = signal<string>('TODOS'); // TODOS, MAYOR_A_0, IGUAL_A_0, MENOR_A_0

  lista = signal<any[]>([]);
  listaExportacion = signal<any[]>([]);

  fechaHoyTexto = new Date().toISOString().split('T')[0];
  fechaHoy = new Date();

  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];
  listaSucursales = sucursales.filter(s => s.id !== 'TODOS');

  saldoOpciones = [
    { value: 'TODOS', label: 'TODOS' },
    { value: 'MAYOR_A_0', label: 'MAYOR A 0' },
    { value: 'IGUAL_A_0', label: 'IGUAL A 0' },
    { value: 'MENOR_A_0', label: 'MENOR A 0' }
  ];

  @ViewChild('tabla') tabla!: ElementRef;

  private cargando = inject(SpinnerService);
  private productoServicio = inject(ProductoService);
  private titleService = inject(Title);
  private excelServicio = inject(ExcelService);

  constructor() {
    // React to signal updates
    effect(() => {
      // Accessing signals to track dependencies
      const suc = this.sucursal();
      const tip = this.tipo();
      const pub = this.publicado();
      const sal = this.saldoFiltro();
      
      if (suc && tip) {
        this.obtenerConsulta();
      } else {
        this.lista.set([]);
        this.listaExportacion.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Reporte 11 - Inventario con Imágenes');
  }

  obtenerConsulta(): void {
    this.cargando.show();
    const queryParams = {
      sucursal: this.sucursal(),
      tipo: this.tipo(),
      publicado: this.publicado(),
      limite: 500
    };
    this.productoServicio.obtenerConsultaConSaldoReporte(queryParams).then((respuesta: any) => {
      console.log('CONSULTA CON SALDO (REPORT 11): ', respuesta);
      
      // Aplicar filtro de Saldo en el cliente
      let filtrada = respuesta || [];
      const filtro = this.saldoFiltro();
      if (filtro === 'MAYOR_A_0') {
        filtrada = filtrada.filter((item: any) => Number(item?.cantidadSaldoTotal ?? 0) > 0);
      } else if (filtro === 'IGUAL_A_0') {
        filtrada = filtrada.filter((item: any) => Number(item?.cantidadSaldoTotal ?? 0) === 0);
      } else if (filtro === 'MENOR_A_0') {
        filtrada = filtrada.filter((item: any) => Number(item?.cantidadSaldoTotal ?? 0) < 0);
      }

      this.lista.set(filtrada);
      this.listaExportacion.set(this.transformarDatos(filtrada));
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
            sumas[key] = 0;
          }
          sumas[key] += valor;
        }
      });
    });
    Object.keys(sumas).forEach(key => {
      sumas[key] = parseFloat(sumas[key].toFixed(2));
    });

    return sumas;
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
              <title>InventarioFisicoImagenes-${this.sucursal()}-${this.tipo()}-${this.saldoFiltro()}-${this.fechaHoyTexto}</title>
              <style>
                .no-imprimir {
                  display: none;
                }
                .tabla-estilizada {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 5px 0;
                  font-size: 0.85rem;
                  font-family: Arial, sans-serif;
                  background-color: #ffffff;
                }

                /* Encabezado de la tabla */
                .tabla-estilizada thead {
                  background-color: #11cc0b;
                  color: #fff;
                  text-align: left;
                }

                .tabla-estilizada th {
                  padding: 6px;
                  font-weight: bold;
                  text-transform: uppercase;
                  letter-spacing: 0.03em;
                  border: 1px solid #000000;
                }

                /* Cuerpo de la tabla */
                .tabla-estilizada td {
                  padding: 6px;
                  color: #000000;
                  border: 1px solid #000000;
                  vertical-align: middle;
                }

                .img-reporte {
                  width: 60px;
                  height: 60px;
                  object-fit: cover;
                  border-radius: 4px;
                  display: block;
                  margin: auto;
                }
              </style>
            </head>
            <body>
              ${printContents}
              <script>
                window.addEventListener('load', () => {
                  const images = Array.from(document.querySelectorAll('img'));
                  const promises = images.map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                      img.onload = resolve;
                      img.onerror = resolve;
                    });
                  });
                  Promise.all(promises).then(() => {
                    setTimeout(() => {
                      window.print();
                    }, 500);
                  });
                });
              </script>
            </body>
          </html>`
        );
        popupWin.document.close();
      }
    }, 200);
  }

  transformarDatos(lista: any[]): any[] {
    const resultado: any[] = [];
    const suc = this.sucursal();

    for (const item of lista) {
      const saldo = Number(item?.cantidadSaldoTotal ?? 0);

      const base = {
        Sucursal: suc,
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

  exportarJsonAExcel(): void {
    const filename = `Inventario-${this.sucursal()}-${this.tipo()}-${this.saldoFiltro()}-`;
    this.excelServicio.exportarAExcel(this.listaExportacion(), filename);
  }

  exportarJson(): void {
    const filename = `Inventario-${this.sucursal()}-${this.tipo()}-${this.saldoFiltro()}-`;
    this.excelServicio.exportarAExcel(this.listaExportacion(), filename);
  }
}
