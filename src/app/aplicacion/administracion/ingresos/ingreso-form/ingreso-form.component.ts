import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';




import { AuthService } from '../../../servicios/auth.service';
import { IngresoService } from '../../../servicios/ingreso.service';
import { UsuarioService } from '../../../servicios/usuario.service';
import { tiposIngresos } from '../../../modelos/tipos';
import { sucursales } from '../../../datos/sucursales';

@Component({
  selector: 'app-ingreso-form',
  templateUrl: './ingreso-form.component.html',
  styleUrls: ['./ingreso-form.component.scss'],
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

  ],
})
export class IngresoFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  boton = false;
  listaTipos = tiposIngresos;

  listaSucursales = sucursales;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<IngresoFormComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private auth: AuthService,
    private ingresoServicio: IngresoService,
    private uServicio: UsuarioService,
  ) {

    if (data.nuevo) {
      const fechaNueva = new Date().toISOString().split('T')[0];
      // const fechaActual = new Date();
      // const mesActual = fechaActual.getMonth() + 2;

      this.registroFormGroup = this.fb.group({
        fecha: [fechaNueva, [Validators.required]],
        sucursal: [null, [Validators.required]],

        // codigo: [null, [Validators.required]],
        tipo: ['COMPRA', [Validators.required]],
        descripcion: [null, [Validators.required]],
        total: [0, [Validators.required]],

        finalizado: [false],
        aprobado: [false],

        activo: [true],

        // Auditoria
        usuarioRegistro: [this.auth.obtenerUsuario.email],
        fechaRegistro: [this.fechaHoy],

        registroUsuario: [this.auth.obtenerUsuario.email],
        registroFecha: [this.fechaHoy]
      });
      this.establecerSuscripcion();
    } else {
      this.ingresoServicio.obtenerPorId(data.id).then(res => {
        this.registroFormGroup = this.fb.group({
          fecha: [res.fecha, [Validators.required]],

          sucursal: [{ value: res.sucursal, disabled: true }, [Validators.required]],

          tipo: [res.tipo, [Validators.required]],
          codigo: [res.codigo, [Validators.required]],
          descripcion: [res.descripcion, [Validators.required]],

          total: [res.total, [Validators.required]],

          usuarioEditor: [this.auth.obtenerUsuario.email],
          fechaActualizacion: [this.fechaHoy],

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
    
        this.r.porcentajePermitido.valueChanges.subscribe((val: any) => {
          this.calcularTodo();
        });
    
        this.r.interes.valueChanges.subscribe((val: any) => {
          this.calcularTodo();
        });
    
        this.r.productoPrecioActual.valueChanges.subscribe((val: any) => {
          this.calcularTodo();
        });
    
        this.r.meses.valueChanges.subscribe((val: any) => {
          this.calcularTodo();
        }); */

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
        this.ingresoServicio.crear(this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, registrado con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(respuesta);
          this.cargando.hide();
        });
      } else {
        this.ingresoServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
          this.snackbar.open('Hey!, actualizacion con exito...', 'OK', { duration: 10000 });
          this.dialogRef.close(true);
          this.cargando.hide();
        });
      }

    }
  }


  calcularPorcentaje(valor: number, porcentaje: number): number { return valor * (porcentaje / 100); }

  calcularTodo() {

    const productoPrecioActual = this.r.productoPrecioActual.value;
    const porcentajePermitido = this.r.porcentajePermitido.value;

    const montoEstimado = this.calcularPorcentaje(productoPrecioActual, porcentajePermitido);
    this.r.montoEstimado.setValue(montoEstimado);

    const interes = this.r.interes.value;

    const interesCalculado = this.calcularPorcentaje(montoEstimado, interes);
    this.r.interesCalculado.setValue(interesCalculado);

    const meses = this.r.meses.value;

    const cuota = montoEstimado / meses;
    console.log('COUTA MENSUAL: ', cuota);
    const cuotas = cuota + interesCalculado;

    this.r.cuotas.setValue(cuotas.toFixed(2));

    // return valor * (porcentaje / 100);
  }

  ngOnDestroy() {
    // this.usuariosSubscription.unsubscribe();
  }
}
