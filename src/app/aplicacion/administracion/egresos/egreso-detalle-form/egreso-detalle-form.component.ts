import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { EgresoDetalleService } from '../../../servicios/egreso-detalle.service';



@Component({
  selector: 'app-egreso-detalle-form',
  templateUrl: './egreso-detalle-form.component.html',
  styleUrls: ['./egreso-detalle-form.component.scss'],
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
  ],
})
export class EgresoDetalleFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;

  detalle: any;

  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private egresoDetalleServicio: EgresoDetalleService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EgresoDetalleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    // this.detalle = data.objeto;
    // FORM EDITAR
    this.egresoDetalleServicio.obtenerPorId(data.id).then(respuesta => {

      this.detalle = respuesta;
      const cantidadSaldo = this.detalle.cantidadSaldo;

      this.registroFormGroup = this.fb.group({
        cantidad: [
          respuesta.cantidad, [Validators.pattern('^[1-9][0-9]*$'), this.validarCantidadMaxima(cantidadSaldo)]],
        pc: [
          { value: respuesta.pc, disabled: true },
          [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*\\.?[0-9]*$')]
        ],
        pv: [
          respuesta.pv,
          [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*\\.?[0-9]*$')]
        ],
        subtotal: [{ value: respuesta.subtotal, disabled: true }],
        // lote: [respuesta.lote, [Validators.required]],
        // loteFecha: [          respuesta.loteFecha,          [Validators.required, this.fechaFuturaValidator]        ]
        detalle: [respuesta.detalle],
      });
      this.establecerSuscripcion();
    });
  }

  ngOnInit(): void {
    setTimeout(() => {

    }, 0);
  }

  get r(): any { return this.registroFormGroup.controls; }

  establecerSuscripcion() {
    this.r.cantidad.valueChanges.subscribe((val: any) => {
      this.calcular();
    });
    this.r.pv.valueChanges.subscribe((val: any) => {
      this.calcular();
    });
  }

  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Oyeeeee! algun campo requieren tu atencion...', 'OK', {
        duration: 10000,
      });
      return;
    } else {
      this.egresoDetalleServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
        this.snackbar.open('Super! Actualizacion con exito...', 'OK', {
          duration: 10000
        });
        this.dialogRef.close(true);
      });
    }
  }

  fechaFuturaValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const fechaActual = new Date();
    const fechaSeleccionada = new Date(control.value);
    if (fechaSeleccionada < fechaActual) {
      return { fechaFutura: true };
    }
    return null;
  }

  calcular() {
    const cantidad = this.r.cantidad.value;
    const pv = this.r.pv.value;
    const subtotal = cantidad * pv;
    this.r.subtotal.setValue(subtotal)
  }

  validarCantidadMaxima(cantidadSaldo: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cantidad = control.value;
      if (cantidad > cantidadSaldo) {
        // La cantidad ingresada es mayor que la cantidad en saldo
        return { cantidadExcesiva: true };
      }
      return null; // No hay error
    };
  }
}
