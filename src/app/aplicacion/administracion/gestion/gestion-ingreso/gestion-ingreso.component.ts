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
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';
import { GestionIngresoFormComponent } from './gestion-ingreso-form/gestion-ingreso-form.component';
import { MatDialog } from '@angular/material/dialog';
import { ProductoService } from '../../../servicios/producto.service';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';
import { CalculoService } from '../../../servicios/calculo.service';

@Component({
  selector: 'app-gestion-ingreso',
  templateUrl: './gestion-ingreso.component.html',
  styleUrl: './gestion-ingreso.component.scss',
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
export class GestionIngresoComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  lista: any[] = [];
  originalLista: any[] = [];

  fechaHoy = new Date().toISOString().split('T')[0];

  totales: any;

  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];
  limites = limites;

  listaProductos: any = [];

  @ViewChild('tabla') tabla!: ElementRef;
  @ViewChild('productoSelect', { static: false }) productoSelect!: NgSelectComponent;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private ingresoDetalleServicio: IngresoDetalleService,
    private productoServicio: ProductoService,
    private calculoServicio: CalculoService,
    private titleService: Title
  ) {
    this.buscadorFormGroup = this.fb.group({
      productoId: ['TODOS'],
      tipo: ['TODOS'],
      finalizado: ['true'],
      saldo: ['TODOS'],
      limite: [10],
    });
    this.establecerSuscripcionForm();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Detalles de Ingresos');
    this.cargarProductos();
  }

  // FORM
  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    /*     this.b.tipo.valueChanges.subscribe((val: any) => {
          this.obtenerConsulta();
        }); */

    this.b.productoId.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });

    this.b.saldo.valueChanges.subscribe((val: any) => {
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
    this.cargando.show();
    this.ingresoDetalleServicio.obtenerConsultaGestion(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {

      console.log('CONSULTA: ', respuesta);
      // const lista = respuesta.sort((a: any, b: any) => b.ingresoCodigo - a.ingresoCodigo);
      const lista = respuesta;
      // this.dataSource.data = respuesta;
      this.lista = lista; // Asigna la lista de resultados
      this.originalLista = [...lista]; // Guarda una copia de la lista original
      this.totales = this.calculoServicio.sumarPorColumnas(this.lista);

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

  convertirAgalones(valor: any) {
    const val = valor;
    const galon = val / 3.785412;
    return galon.toFixed(2);
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
    const dialogRef = this.dialog.open(GestionIngresoFormComponent, {
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

  buscarEnJson(jsonData: any[], searchTerm: string): any[] {
    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    return jsonData.filter(item => {
      return Object.values(item).some((value: any) =>
        value.toString().toLowerCase().includes(lowerSearchTerm)
      );
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    if (!filterValue.trim()) {
      // Si el filtro está vacío, restaura la lista original
      this.lista = [...this.originalLista];
    } else {
      // Filtra la lista
      this.lista = this.buscarEnJson(this.originalLista, filterValue);
    }
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
