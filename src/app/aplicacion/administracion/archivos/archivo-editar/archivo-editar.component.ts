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
import { ClienteService } from '../../../servicios/cliente.service';
import { ArchivoService } from '../../../servicios/archivo.service';



@Component({
  selector: 'app-archivo-editar',
  templateUrl: './archivo-editar.component.html',
  styleUrl: './archivo-editar.component.scss',
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
export class ArchivoEditarComponent {

  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ArchivoEditarComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private cargando: SpinnerService,
    private auth: AuthService,
    private archivoServicio: ArchivoService,
  ) {

    this.archivoServicio.obtenerPorId(data.id).then((res: any) => {

      this.registroFormGroup = this.fb.group({

        nombre: [res.nombre, [Validators.required]],

        usuarioEditor: [this.auth.obtenerUsuario.email],
        fechaActualizacion: [this.fechaHoy]
      });
      this.establecerSuscripcion();
    });


  }

  // INICIAR
  ngOnInit() {

  }

  // FORM
  get r(): any { return this.registroFormGroup.controls; }


  establecerSuscripcion() {
    /*     this.r.clienteId.valueChanges.subscribe((val: any) => {
          this.obtenerDatosCliente();
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
      this.cargando.show();
      this.archivoServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
        this.snackbar.open('Hey!, actualizacion con exito...', 'OK', { duration: 10000 });
        this.dialogRef.close(true);
        this.cargando.hide();
      });
    }
  }

}
