import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerService } from '../../sistema/spinner/spinner.service';

// MATERIAL
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AuthService } from '../../servicios/auth.service';

import { UsuarioService } from '../../servicios/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    // MATERIAL
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatButtonModule,
    MatCheckboxModule
  ],
})
export class LoginComponent {
  registroFormGroup: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private authServicio: AuthService,
    private usuarioServicio: UsuarioService,
    private cargando: SpinnerService,
    public router: Router) {
    this.registroFormGroup = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // console.log('USUARIO LOGEADO: ',this.authServicio.getUser() );
  }

  loginGoogle() {
    this.authServicio
      .loginWithGoogle()
      .then((respuesta) => {
        console.log('USUARIO LOGEADO: ', respuesta.user.email);
        this.redireccionar(respuesta.user.email);
      })
      .catch((e) => console.log(e.message));
  }

  onSubmit(): void {
    if (this.registroFormGroup.invalid) {
      return;
    } else {
      this.cargando.show();
      this.authServicio.login(this.registroFormGroup.getRawValue()).then((respuesta: any) => {

        console.log('USUARIO LOGEADO: ', respuesta.user.email);
        this.redireccionar(respuesta.user.email);

        this.cargando.hide();
      }, (error: any) => {
        console.log('ERROR CODIGO: ', error.code);
        console.log('ERROR MENSAJE: ', error.message);
        this.snackbar.open('Datos invalidos...', 'OK', { duration: 3000 });
        this.cargando.hide();
      });
    }
  }

  redireccionar(usuarioId: any) {
    this.cargando.show()
    this.usuarioServicio.obtenerPorId(usuarioId).then((res: any) => {

      if (res.activo && res.adminTipo === 'administrador') {
        this.router.navigate(['administracion']);
      } else if (res.activo && res.adminTipo === 'conductor') {
        this.router.navigate(['conductor']);
      } else {
        this.router.navigate(['']);
      }
      this.cargando.hide();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
