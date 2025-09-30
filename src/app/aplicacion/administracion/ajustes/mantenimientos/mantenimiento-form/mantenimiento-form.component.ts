import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from '../../../../servicios/auth.service';
import { MantenimientoService } from '../../../../servicios/mantenimiento.service';

@Component({
  selector: 'app-mantenimiento-form',
  templateUrl: './mantenimiento-form.component.html',
  styleUrl: './mantenimiento-form.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,

    // MATERIAL
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule

  ],
})
export class MantenimientoFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();
  boton = false;

  tipos = ['PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MantenimientoFormComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private auth: AuthService,
    private mServicio: MantenimientoService,
  ) {

    if (data.nuevo) {
      const fechaNueva = new Date().toISOString().split('T')[0];
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 2;

      this.registroFormGroup = this.fb.group({
        //id: [0, [Validators.required]],

        tipo: [null, [Validators.required]],
        descripcion: [null, [Validators.required]],

        frecuencia: [true],
        kilometraje: [true],
        activo: [true],

        registroUsuario: [this.auth.obtenerUsuario.email],
        registroFecha: [this.fechaHoy]
      });
      this.establecerSuscripcion();
    } else {
      this.mServicio.obtenerPorId(data.id).then((res: any) => {

        this.registroFormGroup = this.fb.group({

          id: [{ value: data.id, disabled: true }, [Validators.required]],

          tipo: [res.tipo, [Validators.required]],
          descripcion: [res.descripcion, [Validators.required]],

          frecuencia: [res.frecuencia],
          kilometraje: [res.kilometraje],
          activo: [res.activo],

          edicionUsuario: [this.auth.obtenerUsuario.email],
          edicionFecha: [this.fechaHoy]
        });
        this.establecerSuscripcion();
      });
    }

  }

  // INICIAR
  ngOnInit() {

  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    /*     this.r.usuario.valueChanges.subscribe((val: any) => {
          this.usuarioSeleccionado = val;
        });
     */
  }

  // REGISTRAR
  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Se requerie datos...', 'OK', {
        duration: 3000
      });
      return;
    } else {
      this.boton = true;
      if (this.data.nuevo) {
        this.cargando.show();
        this.mServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, registrado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      } else {
        this.mServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, actualizacion con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }
    }
  }
}
