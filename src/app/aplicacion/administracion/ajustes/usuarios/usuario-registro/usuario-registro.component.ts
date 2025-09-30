import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../../../sistema/spinner/spinner.service';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AuthService } from '../../../../servicios/auth.service';
import { UsuarioService } from '../../../../servicios/usuario.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-usuario-registro',
  templateUrl: './usuario-registro.component.html',
  styleUrl: './usuario-registro.component.scss',
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
export class UsuarioRegistroComponent {
  registroFormGroup!: FormGroup;
  registroControl = false;
  fechaHoy = new Date();

  usuario: any | null = null;

  showPassword: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UsuarioRegistroComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    private usuarioServicio: UsuarioService,
  ) {

    this.authServicio.user$.subscribe((user) => {
      if (user) {
        this.usuario = user;

        this.registroFormGroup = this.fb.group({
          email: [null, [Validators.required, Validators.email]],
          password: [null, [Validators.required, Validators.minLength(6)]],
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
    if (this.registroFormGroup.invalid) {
      return;
    } else {
      this.cargando.show();
      this.authServicio.crear(this.registroFormGroup.getRawValue()).then((res: any) => {
        this.dialogRef.close(true);
        this.cargando.hide();
        // console.log('USUARIO CREADO: ', res);
      }, (error: any) => {
        // console.log('ERROR: ', error.message);
        this.snackbar.open(error.message, 'De Acuerdo', { duration: 5000 });
        this.cargando.hide();
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
