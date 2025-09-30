import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AuthService } from '../../../../servicios/auth.service';
import { UsuarioService } from '../../../../servicios/usuario.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-permiso-acceso',
  templateUrl: './permiso-acceso.component.html',
  styleUrl: './permiso-acceso.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatListModule

  ],
})
export class PermisoAccesoComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  usuario: any | null = null;

  tipos = ['administrador', 'cliente'];

  listaAccesos = [
    { link: '/administracion/estadisticas', icon: 'bar_chart', label: 'Estadisticas', color: 'text-blue-500', selected: false, nav: false },

    { link: '/administracion/vehiculos', icon: 'directions_bus', label: 'Vehiculos', color: 'text-blue-500', selected: false, nav: false },
    { link: '/administracion/productos', icon: 'solar_power', label: 'Productos', color: 'text-blue-500', selected: false, nav: false },
    // { link: '/administracion/clientes', icon: 'people', label: 'Clientes', color: 'text-blue-500', selected: false, nav: false },

    { link: '/administracion/programaciones', icon: 'event', label: 'Programacion', color: 'text-blue-500', selected: false, nav: true },
    { link: '/administracion/ordenes', icon: 'assignment', label: 'Ordenes', color: 'text-blue-700', selected: false, nav: true },

    { link: '/administracion/ingresos', icon: 'add_box', label: 'Ingresos', color: 'text-blue-500', selected: false, nav: false },
    { link: '/administracion/egresos', icon: 'indeterminate_check_box', label: 'Egresos', color: 'text-blue-500', selected: false, nav: false },
   
    { link: '/administracion/gestion', icon: 'update', label: 'Gestiones', color: 'text-blue-500', selected: false, nav: false },
    
    { link: '/administracion/conductores', icon: 'person', label: 'Conductores', color: 'text-blue-500', selected: false, nav: false },
    { link: '/administracion/asignaciones', icon: 'handyman', label: 'Asignaciones', color: 'text-blue-500', selected: false, nav: false },
    { link: '/administracion/documentos', icon: 'task', label: 'Documentos', color: 'text-blue-500', selected: false, nav: false },

    { link: '/administracion/archivos', icon: 'folder', label: 'Archivos', color: 'text-blue-500', selected: false, nav: false },
    { link: '/administracion/reportes', icon: 'summarize', label: 'Reportes', color: 'text-blue-500', selected: false, nav: false },
    { link: '/administracion/ajustes', icon: 'settings', label: 'Ajustes', color: 'text-blue-500', selected: false, nav: false },
    
    { link: '/administracion/buscadores', icon: 'search', label: 'Buscar...', color: 'text-blue-500', selected: false, nav: true }


  ];

  listaPermitidos: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PermisoAccesoComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    private usuarioServicio: UsuarioService,
  ) {
    this.initForm(); // Inicializamos el formulario
    this.cargarDatosUsuario();
  }

  // INICIAR
  ngOnInit() {

  }

  initForm() {
    this.registroFormGroup = this.fb.group({
      usuarioCambioAcceso: [''],
      fechaCambioAcceso: [new Date()],
    });
  }

  cargarDatosUsuario() {
    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuarioServicio.obtenerPorId(this.data.id).then((res: any) => {
          const accesosGuardados = res.accesos || [];

          // Marcar los accesos seleccionados en `listaAccesos`
          this.listaAccesos = this.listaAccesos.map((acceso) => ({
            ...acceso,
            selected: accesosGuardados.some((guardado: any) => guardado.link === acceso.link),
          }));

          this.registroFormGroup.patchValue({
            usuarioCambioAcceso: user.email,
          });
        });
      }
    });
  }

  toggleAcceso(acceso: any) {
    acceso.selected = !acceso.selected; // Cambiar el estado del acceso
  }

  onSubmit(): void {
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Se requiere datos...', 'OK', { duration: 3000 });
      return;
    }

    const accesosSeleccionados = this.listaAccesos
      .filter((acceso) => acceso.selected) // Solo los accesos seleccionados
      .map(({ link, icon, label, color, nav }) => ({ link, icon, label, color, nav })); // Extraer los campos necesarios

    this.cargando.show();
    this.usuarioServicio
      .editar(this.data.id, {
        ...this.registroFormGroup.getRawValue(),
        accesos: accesosSeleccionados,
      })
      .then(() => {
        this.snackbar.open('¡Actualización exitosa!', 'OK', { duration: 10000 });
        this.dialogRef.close(true);
        this.cargando.hide();
      });
  }

  /* initForm() {
    this.registroFormGroup = this.fb.group({
      accesos: [[]], // Lista inicial de accesos permitidos
      usuarioCambioAcceso: [''],
      fechaCambioAcceso: [new Date()],
    });
  }

  cargarDatosUsuario() {
    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuarioServicio.obtenerPorId(this.data.id).then((res: any) => {
          this.listaPermitidos = res.accesos || []; // Carga los accesos permitidos

          // Agrega la propiedad `selected` a cada acceso en listaAccesos
          this.listaAccesos = this.listaAccesos.map((acceso) => ({
            ...acceso,
            selected: this.listaPermitidos.some(
              (permitido: any) => permitido.link === acceso.link
            ),
          }));

          // Actualiza el formulario con los datos del usuario
          this.registroFormGroup.patchValue({
            accesos: this.listaPermitidos,
            usuarioCambioAcceso: user.email,
          });
        });
      }
    });
  }


  manejarSeleccion(event: any) {
    const opciones = event.options || [];
    opciones.forEach((opcion: any) => {
      const seleccionado = opcion.value;
      if (opcion.selected) {
        this.adicionar(seleccionado);
      } else {
        this.quitar(seleccionado);
      }
    });
  }

  adicionar(acceso: any) {
    const existe = this.listaPermitidos.find((item: any) => item.link === acceso.link);
    if (!existe) {
      this.listaPermitidos.push(acceso);
      this.registroFormGroup.get('accesos')?.setValue(this.listaPermitidos);
    }
  }

  quitar(acceso: any) {
    this.listaPermitidos = this.listaPermitidos.filter((item: any) => item.link !== acceso.link);
    this.registroFormGroup.get('accesos')?.setValue(this.listaPermitidos);
  }

  onSubmit(): void {
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Se requiere datos...', 'OK', { duration: 3000 });
      return;
    }
    this.cargando.show();
    this.usuarioServicio.editar(this.data.id, {
      ...this.registroFormGroup.getRawValue(),
      accesos: this.listaPermitidos,
    }).then(() => {
      this.snackbar.open('¡Actualización exitosa!', 'OK', { duration: 10000 });
      this.dialogRef.close(true);
      this.cargando.hide();
    });
  } */
}
