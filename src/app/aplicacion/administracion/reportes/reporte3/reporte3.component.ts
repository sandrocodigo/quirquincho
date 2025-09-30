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

import { limites } from '../../../datos/limites';
import { Title } from '@angular/platform-browser';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';

@Component({
  selector: 'app-reporte3',
  templateUrl: './reporte3.component.html',
  styleUrl: './reporte3.component.scss',
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
export class Reporte3Component {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;
  lista: any;

  fechaHoy = new Date().toISOString().split('T')[0];

  totales: any;

  totalDineroPorFecha: any[] = [];

  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];
  limites = limites;

  @ViewChild('tabla') tabla!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private cargando: SpinnerService,
    private egresoDetalleServicio: EgresoDetalleService,
    private titleService: Title
  ) {
    this.buscadorFormGroup = this.fb.group({
      tipo: ['TODOS'],
      finalizado: ['true'],
      saldo: ['TODOS'],
      limite: [100],
    });
    this.establecerSuscripcionForm();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Reporte 3');
  }

  // FORM
  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.finalizado.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.limite.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
  }

  obtenerConsulta(): void {
    this.cargando.show();
    this.egresoDetalleServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {
      console.log('CONSULTA: ', respuesta);
      this.lista = respuesta;
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
}
