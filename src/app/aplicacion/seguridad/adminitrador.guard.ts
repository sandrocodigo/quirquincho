import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { UsuarioService } from '../servicios/usuario.service';
import { AuthService } from '../servicios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdministradorGuard {

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private authServicio: AuthService,
  ) { }

  canActivate(): Observable<boolean> {
    // Esperar a que se obtenga el usuario autenticado
    return this.authServicio.user$.pipe(
      switchMap((user) => {
        if (!user) {
          console.log('SIN USUARIO....');  // Si no hay usuario autenticado, redirigir al login
          this.router.navigate(['/login']);
          return of(false);
        }

        // Si hay usuario, buscar en Firestore si es admin
        return from(this.usuarioService.obtenerPorId(user.email)).pipe(
          map((userData: any) => {
            // console.log('USUARIO DE FIRESTOR :', userData);
            if (userData && userData.activo && userData.adminTipo === 'administrador') {
              return true;  // El usuario es admin y puede acceder
            } else {
              this.router.navigate(['/']);  // Si no es admin, redirigir al inicio
              return false;
            }
          }),
          catchError(() => {
            this.router.navigate(['/']);  // En caso de error, redirigir al inicio
            return of(false);
          })
        );
      })
    );
  }
}
