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
import { EmailService } from '../../servicios/email.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
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
export class RegistroComponent {
  registroFormGroup: FormGroup;
  showPassword: boolean = false;

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    private authServicio: AuthService,
    private emailServicio: EmailService,
    ) {
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
      .then(() => this.router.navigate(['']))
      .catch((e) => console.log(e.message));
  }

  onSubmit(): void {
    if (this.registroFormGroup.invalid) {
      return;
    } else {
      this.cargando.show();
      this.authServicio.crear(this.registroFormGroup.getRawValue()).then((res: any) => {
        // this.enviarEmail(this.registroFormGroup.getRawValue());
        this.router.navigate(['/']);
        this.cargando.hide();
        // console.log('USUARIO CREADO: ', res);
      }, (error: any) => {
        // console.log('ERROR: ', error.message);
        this.snackbar.open(error.message, 'De Acuerdo', {          duration: 5000        });
        this.cargando.hide();
      });
    }
  }

  enviarEmail(datos: any) {
    const correo = {
      from: `"MiAppPRO - Cybersecurity" <contacto@miapppro.com>`,
      to: datos.email,
      message: {
        subject: 'Registro: Cybersecurity PRO',
        html:
          '<div style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; padding: 4px;">' +
          '<div style="background: linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593);' +
          '-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; ' +
          'color: rgb(241, 243, 243); font-size: 25px; text-align: center;">' +
          'MIAPPPRO - Cybersecurity' +
          '</div>' +
          '<br>' +
          '<div style="font-size: 15px;">' +
          '<p> Hola: ' +
          'Como estas?' +
          '</p>' +
          '<hr>' +
          '<p> MiAppPRO: te da la bienvenida al Sistema de Gestion Administrativa de Ciberseguridad </p>' +
          '<hr>' +
          '<br>' +
          '<h1><a href="https://cybersecurity.miapppro.com/' + 
          '" target="_blank">Empecemos...' +
          '</a></h1>' +
          '<br>' +
          '<hr>' +
          '</div>' +
          '<br>' +
          '<div style = "background: linear-gradient(to right, #078d9c, #3697d8, #08c89f, #0d8002);' +
          '-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px;' +
          'color: rgb(241, 243, 243); font-size: 15px; text-align: center;">' +
          '© Copyrights 2023 MIAPPPRO All rights reserved.' +
          '</div> ' +
          '</div> ',
      },
    }

    this.emailServicio.crear(correo).then((respuesta: any) => {
      this.cargando.hide();
      this.snackbar.open('Ya casi listos!, Por favor revisa tu correo para validar tu correo', 'De acuerdo!', {
        duration: 5000
      });
    });

  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
