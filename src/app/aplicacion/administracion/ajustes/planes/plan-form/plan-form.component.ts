import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AuthService } from '../../../../servicios/auth.service';
import { PlanService } from '../../../../servicios/plan.service';




@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrl: './plan-form.component.scss',
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
    MatSelectModule,
    MatSlideToggleModule
  ],
})
export class PlanFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  boton = false;

  listaCategorias: any;
  listaFabricantes: any;

  usuarioSeleccionado: any;
  usuario: any | null = null;

  gestiones = [2024, 2025, 2026];

  meses = [
    { id: 1, descripcion: 'Enero' },
    { id: 2, descripcion: 'Febrero' },
    { id: 3, descripcion: 'Marzo' },
    { id: 4, descripcion: 'Abril' },
    { id: 5, descripcion: 'Mayo' },
    { id: 6, descripcion: 'Junio' },
    { id: 7, descripcion: 'Julio' },
    { id: 8, descripcion: 'Agosto' },
    { id: 9, descripcion: 'Septiembre' },
    { id: 10, descripcion: 'Octubre' },
    { id: 11, descripcion: 'Noviembre' },
    { id: 12, descripcion: 'Diciembre' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PlanFormComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private planServicio: PlanService,
    public authServicio: AuthService,
  ) {

    this.authServicio.user$.subscribe((user) => {
      this.usuario = user;
      // console.log('USUARIO_EMAIL: ', this.usuario.email);
      if (data.nuevo) {
        // FORM NUEVO
        this.registroFormGroup = this.fb.group({

          gestion: [2025, [Validators.required]],
          mes: [null, [Validators.required]],

          descripcion: ['Desarrollo y Mantenimiento de Sistema', [Validators.required]],
          monto: [350, [Validators.required]],

          pagado: [false],

          fechaInicio: [],
          fechaFinal: [],
          fechaLimite: [],

          usuarioCreador: [this.usuario.email],
          fechaRegistro: [this.fechaHoy],

        });
        this.establecerSuscripcion();
      } else {

        // FORM EDITAR
        this.cargando.show();
        this.planServicio.obtenerPorId(data.objeto.id).then((respuesta: any) => {
          console.log('PROYECTO: ', respuesta);
          this.registroFormGroup = this.fb.group({

            gestion: [respuesta.gestion, [Validators.required]],
            mes: [respuesta.mes, [Validators.required]],

            descripcion: [respuesta.descripcion, [Validators.required]],
            monto: [respuesta.monto, [Validators.required]],

            pagado: [respuesta.pagado],

            fechaInicio: [respuesta.fechaInicio],
            fechaFinal: [respuesta.fechaFinal],
            fechaLimite: [respuesta.fechaLimite],

            usuarioEditor: [this.usuario.email],
            fechaActualizacion: [this.fechaHoy]
          });
          this.establecerSuscripcion();
          this.cargando.hide();
        });
      }
    });
  }

  // INICIAR
  ngOnInit() {

  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    this.r.gestion.valueChanges.subscribe((val: any) => {
      this.cargarFechas();
    });
    this.r.mes.valueChanges.subscribe((val: any) => {
      console.log(val);
      this.cargarFechas();
    });

  }

  cargarFechas() {
    const gestion = this.r.gestion.value;
    const mes = this.r.mes.value;
  
    // Crear una nueva fecha con el primer día del mes
    const fechaInicio = new Date(gestion, mes - 1, 1);
  
    // Crear una nueva fecha con el último día del mes
    const fechaFinal = new Date(gestion, mes, 0); // Día 0 del mes siguiente es el último día del mes actual
  
    // Crear la fecha límite, que es el día 10 del mes
    const fechaLimite = new Date(gestion, mes - 1, 10);
  
    // Convertir las fechas a formato 'YYYY-MM-DD'
    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
    const fechaFinalStr = fechaFinal.toISOString().split('T')[0];
    const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];
  
    // Establecer los valores de los campos en el formulario como strings
    this.r.fechaInicio.setValue(fechaInicioStr);
    this.r.fechaFinal.setValue(fechaFinalStr);
    this.r.fechaLimite.setValue(fechaLimiteStr);
  
    console.log(this.r.fechaInicio.value);
  }
  


  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Se requerie datos...', 'OK', {
        duration: 10000
      });
      return;
    } else {
      if (this.data.nuevo) {
        this.cargando.show();
        this.planServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.dialogRef.close(true);
          this.snackbar.open('Hey!, creamos con exito...', 'OK', { duration: 10000 });
          this.cargando.hide();
        });
      } else {
        this.cargando.show();
        this.planServicio.editar(this.data.objeto.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          // console.log('PROYECTO EDICION: ', respuesta.id);
          this.snackbar.open('Hey!, actualizamos con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }
    }
  }

}
