import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

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
import { MatDialog } from '@angular/material/dialog';
import { ProductoService } from '../../../servicios/producto.service';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';
import { GestionEgresoForm } from './gestion-egreso-form/gestion-egreso-form';
import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';
import { CalculoService } from '../../../servicios/calculo.service';

@Component({
  selector: 'app-gestion-egreso',
  templateUrl: './gestion-egreso.html',
  styleUrl: './gestion-egreso.css',
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
    MatDividerModule,

    NgSelectModule
  ],
})
export class GestionEgreso {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  lista: any[] = [];
  originalLista: any[] = [];

  fechaHoy = new Date().toISOString().split('T')[0];

  totales: any;

  limites = limites;

  listaProductos: any = [];

  @ViewChild('tabla') tabla!: ElementRef;

  @ViewChild('productoSelect', { static: false }) productoSelect!: NgSelectComponent;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private egresoDetalleServicio: EgresoDetalleService,
    private productoServicio: ProductoService,
    private calculoServicio: CalculoService,
    private titleService: Title
  ) {
    this.buscadorFormGroup = this.fb.group({
      productoId: ['TODOS'],
      tipo: ['TODOS'],
      finalizado: ['true'],
      limite: [10],
    });
    this.establecerSuscripcionForm();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Detalles de Egresos');
    this.cargarProductos();
  }

  // FORM
  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.productoId.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.finalizado.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.limite.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
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

  obtenerProductos() {
    this.cargando.show();
    this.productoServicio.obtenerConsulta({
      tipo: 'TODOS',
      activo: 'true',
      publicado: 'TODOS',
      categoria: 'TODOS',
      limite: 500
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

  // CONSULTA 2025
  obtenerConsulta(): void {
    this.cargando.show('Consultando...');
    this.egresoDetalleServicio.obtenerConsultaGestion(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {

      console.log('CONSULTA: ', respuesta);
      // const lista = respuesta.sort((a: any, b: any) => b.ingresoCodigo - a.ingresoCodigo);
      const lista = respuesta;

      // this.dataSource.data = respuesta;
      this.lista = lista; // Asigna la lista de resultados
      this.totales = this.calculoServicio.sumarPorColumnas(this.lista);
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

  editar(fila: any) {
    const dialogRef = this.dialog.open(GestionEgresoForm, {
      width: '600px',
      data: {
        nuevo: true,
        //idIngreso: this.idIngreso,
        //ingreso: this.ingreso,
        id: fila.id,
        objeto: fila
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerConsulta();
      }
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
}
