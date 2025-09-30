import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { UsuarioService } from '../servicios/usuario.service';
import { AuthService } from '../servicios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AccesoGuard {

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private authServicio: AuthService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Obtener la URL de la ruta que se está intentando acceder
    const rutaActual = state.url;
    // console.log(rutaActual);

    return this.authServicio.user$.pipe(
      switchMap((user) => {
        if (!user) {
          console.log('SIN USUARIO....');  // Si no hay usuario autenticado, redirigir al login
          this.router.navigate(['/login']);
          return of(false);
        }

        // Si hay usuario, buscar en Firestore
        return from(this.usuarioService.obtenerPorId(user.email)).pipe(
          map((userData: any) => {
            // Verificar si el usuario está activo
            if (!userData || !userData.activo) {
              this.router.navigate(['/']);  // Usuario inactivo, redirigir al inicio
              return false;
            }

            // Verificar si el usuario tiene acceso a la ruta actual
            const tieneAcceso = userData.accesos.some((acceso: any) => acceso.link === rutaActual);

            if (tieneAcceso) {
              return true;  // El usuario tiene acceso a la ruta
            } else {
              console.warn(`Acceso denegado a la ruta: ${rutaActual}`);
              this.router.navigate(['/']);  // Redirigir al inicio si no tiene acceso
              return false;
            }
          }),
          catchError(() => {
            console.error('Error al verificar el acceso del usuario.');
            this.router.navigate(['/']);  // En caso de error, redirigir al inicio
            return of(false);
          })
        );
      })
    );
  }
}
