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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AuthService } from '../../../../servicios/auth.service';
import { UsuarioService } from '../../../../servicios/usuario.service';
import { MatSelectModule } from '@angular/material/select';
import { sucursales } from '../../../../datos/sucursales';


@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss',
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

  ],
})
export class UsuarioFormComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  usuario: any | null = null;

  tipos = ['administrador', 'cliente'];
  listaSucursales = sucursales;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UsuarioFormComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    private usuarioServicio: UsuarioService,
  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;

        this.usuarioServicio.obtenerPorId(data.id).then((res: any) => {
          this.registroFormGroup = this.fb.group({

            activo: [res.activo],
            admin: [res.admin],

            adminTipo: [res.adminTipo],
            sucursal: [res.sucursal],
            
            usuarioCambio: [this.usuario.email],
            fechaCambio: this.fechaHoy
          });
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

    /*     this.r.descripcion.valueChanges.subscribe((val: any) => {
          const nuevoDato = this.tituloServicio.convertir(val);
          this.r.tituloLink.setValue(nuevoDato);
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
      this.usuarioServicio.editar(this.data.id, this.registroFormGroup.getRawValue()).then((respuesta: any) => {
        this.snackbar.open('Hey!, actualizacion con exito...', 'OK', { duration: 10000 });
        this.dialogRef.close(true);
        this.cargando.hide();
      });
    }
  }
}
