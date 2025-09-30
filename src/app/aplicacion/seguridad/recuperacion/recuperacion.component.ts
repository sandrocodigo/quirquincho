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

@Component({
  selector: 'app-recuperacion',
  templateUrl: './recuperacion.component.html',
  styleUrl: './recuperacion.component.scss',
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
export class RecuperacionComponent {
  registroFormGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authServicio: AuthService,
    private snackbar: MatSnackBar,
    private cargando: SpinnerService,
    public router: Router) {
    this.registroFormGroup = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
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
      this.authServicio.resetPassword(this.registroFormGroup.getRawValue()).then((res: any) => {

        this.snackbar.open('Listo, verificar tu correo por favor, para que recuperemos tu password...', 'De Acuerdo', {
          duration: 5000
        });
        this.cargando.hide();
        this.router.navigate(['/']);
        console.log('USUARIO CREADO: ', res);
      }, (error: any) => {
        console.log('ERROR: ', error.message);
        this.snackbar.open(error.message, 'De Acuerdo', {
          duration: 5000
        });
        this.cargando.hide();
      });
    }
  }
}
