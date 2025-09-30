import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';


import { RouterModule } from '@angular/router';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltip } from '@angular/material/tooltip';
import { ConfirmacionComponent } from '../../../sistema/confirmacion/confirmacion.component';
import { AuthService } from '../../../servicios/auth.service';
import { limites } from '../../../datos/limites';

import { BreakpointObserver } from '@angular/cdk/layout';

import { VehiculoService } from '../../../servicios/vehiculo.service';
import { DocumentoFormComponent } from '../documento-form/documento-form.component';
import { DocumentoService } from '../../../servicios/documento.service';
import { documentoTipos } from '../../../datos/documento-tipos';

@Component({
  selector: 'app-documento-lista',
  templateUrl: './documento-lista.component.html',
  styleUrl: './documento-lista.component.scss',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatTooltip,
    MatMenuModule,
    NgSelectComponent
  ],
})
export class DocumentoListaComponent {
  buscadorFormGroup: FormGroup;
  buscadorControl = false;

  tipos = ['PRODUCTO', 'SERVICIO', 'INSUMO'];
  limites = limites;

  filtro = false;

  usuario: any | null = null;

  listaCategorias: any;

  lista: any[] = [];
  listaOriginal: any[] = [];

  listaVehiculos: any = [];

  listaTipos = documentoTipos;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private dServicio: DocumentoService,
    private authServicio: AuthService,

    private titleService: Title,
    private vehiculoServicio: VehiculoService,
    private breakpointObserver: BreakpointObserver

  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) { this.usuario = user; }
    });

    this.buscadorFormGroup = this.fb.group({
      vehiculoId: ['TODOS'],
      activo: ['true'],
      tipo: ['TODOS'],
      //publicado: ['TODOS'],
      //categoria: ['TODOS'],
      limite: [500],
    });
    this.obtenerConsulta();
    this.establecerSuscripcionForm();


  }

  ngOnInit(): void {
    this.titleService.setTitle('Documentos');

    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.filtro = !result.matches;
      // console.log('Filtro:', this.filtro); // `true` si la pantalla es menor o igual a 768px
    });

    this.obtenerVehiculos()
  }

  ngAfterViewInit() { }

  get b(): any { return this.buscadorFormGroup.controls; }

  establecerSuscripcionForm() {
    this.b.vehiculoId.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.tipo.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.activo.valueChanges.subscribe((val: any) => {
      this.obtenerConsulta();
    });
    this.b.limite.valueChanges.subscribe((val: any) => {
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
      console.log('VEHICULOS', res);
      this.cargando.hide();
    });
  }

  // OBTENER CATEGORIAS
  /*   obtenerCategorias() {
      this.pcServicio.obtenerTodos().then((data: any) => {
        this.listaCategorias = data;
      })
    } */

  obtenerConsulta(): void {
    this.cargando.show();
    this.dServicio.obtenerConsulta(this.buscadorFormGroup.getRawValue()).then((respuesta: any) => {
      console.log('CONSULTA: ', respuesta);

      const hoy = new Date(); // Fecha actual sin horas

      const resultados = respuesta.map((item: any) => {
        const fechaProximo = new Date(item.fechaProximo);
        // Limpiar hora para comparación justa
        const diffTime = fechaProximo.setHours(0, 0, 0, 0) - hoy.setHours(0, 0, 0, 0);
        const diasFaltantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // milisegundos a días

        item.faltaDias = diasFaltantes;
        return item;
      });

      const resultadosOrdenados = resultados.sort((a: any, b: any) => b.vehiculoNumero - a.vehiculoNumero);

      this.lista = resultadosOrdenados;
      this.listaOriginal = [...resultadosOrdenados];

      this.cargando.hide();
    });
  }


  nuevo() {
    const dialogRef = this.dialog.open(DocumentoFormComponent, {
      width: '800px',
      data: {
        nuevo: true,
        id: null,
        objeto: null
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerConsulta();
      }
    });
  }

  orden(fila: any) {
    const dialogRef = this.dialog.open(DocumentoFormComponent, {
      width: '800px',
      data: {
        id: fila.id,
        programacion: fila
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dServicio.editar(fila.id, { ordenGenerado: true, ordenId: result.id, ordenRegistro: new Date() }).then(res => {
          this.obtenerConsulta();
        })
      }
    });
  }

  editar(fila: any) {
    const dialogRef = this.dialog.open(DocumentoFormComponent, {
      width: '800px',
      data: {
        nuevo: false,
        id: fila.id,
        objeto: fila
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerConsulta();
      }
    });
  }

  /* 
    resumen(fila: any) {
      const dialogRef = this.dialog.open(ProductoResumenComponent, {
        width: '800px',
        data: {
          nuevo: false,
          id: fila.id,
          objeto: fila
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          //this.obtenerConsulta();
        }
      });
    } */

  eliminar(fila: any) {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Documento',
        mensaje: '¿Esta seguro de realizar esta accion?',
        nota: '...'
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando.show();
        this.dServicio.editar(fila.id, { activo: false, usuarioElimina: this.usuario.email }).then(result => {
          this.cargando.hide();
          this.snackbar.open('Eliminado...', 'OK', { duration: 10000 });
          this.obtenerConsulta();
        })
      }
    });
  }

  filtros() {
    this.filtro = !this.filtro;
  }


  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    if (!filterValue.trim()) {
      // Si el filtro está vacío, restaura la lista original
      this.lista = [...this.listaOriginal];
    } else {
      // Filtra la lista
      this.lista = this.buscarEnJson(this.listaOriginal, filterValue);
    }
  }

  buscarEnJson(jsonData: any[], searchTerm: string): any[] {
    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    return jsonData.filter(item =>
      Object.values(item).some(value =>
        (value ?? '').toString().toLowerCase().includes(lowerSearchTerm)
      )
    );
  }
}
