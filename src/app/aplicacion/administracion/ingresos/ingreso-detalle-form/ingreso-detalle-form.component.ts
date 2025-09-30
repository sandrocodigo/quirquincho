import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IngresoDetalleService } from '../../../servicios/ingreso-detalle.service';



@Component({
  selector: 'app-ingreso-detalle-form',
  templateUrl: './ingreso-detalle-form.component.html',
  styleUrls: ['./ingreso-detalle-form.component.scss'],
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
export class IngresoDetalleFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  boton = false;

  sucursales: any;
  almacenes: any;
  conceptos = [
    { id: 'TRASPASO', descripcion: 'TRASPASO' },
    { id: 'DEVOLUCION', descripcion: 'DEVOLUCION' },
    { id: 'COMPRA', descripcion: 'TRASPASO' }
  ];

  detalle: any;

  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private ingresoDetalleServicio: IngresoDetalleService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<IngresoDetalleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.detalle = data.objeto;
    // FORM EDITAR
    this.ingresoDetalleServicio.obtenerPorId(data.id).then(respuesta => {
      this.registroFormGroup = this.fb.group({
        cantidad: [respuesta.cantidad, Validators.pattern('^[1-9][0-9]*$')],
        productoCodigoBarra: [respuesta.productoCodigoBarra, [Validators.required]],
        pc: [
          respuesta.pc,
          [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*\\.?[0-9]*$')]
        ],
        pv: [
          respuesta.pv,
          [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*\\.?[0-9]*$')]
        ],
        subtotal: [{ value: respuesta.subtotal, disabled: true }],
        // lote: [respuesta.lote, [Validators.required]],
        // loteFecha: [          respuesta.loteFecha,          [Validators.required, this.fechaFuturaValidator]        ]
      });
    });
  }

  ngOnInit(): void {
    setTimeout(() => {

    }, 0);
  }

  get r(): any { return this.registroFormGroup.controls; }

  onSubmit(): void {
    this.registroControl = true;
    if (this.registroFormGroup.invalid) {
      this.snackbar.open('Oyeeeee! algun campo requieren tu atencion...', 'OK', {
        duration: 10000,
      });
      return;
    } else {
      this.ingresoDetalleServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
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
    const subtotal = Number((this.r.cantidad.value * this.r.pc.value).toFixed(2));
    this.r.subtotal.setValue(subtotal)
  }
}
