import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { AuthService } from '../servicios/auth.service';
import { ViajeService } from '../servicios/viaje.service';

@Injectable({
  providedIn: 'root'
})
export class ConductorViajeGuard {

  constructor(
    private router: Router,
    private viajeService: ViajeService,
    private authServicio: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const idViaje = route.paramMap.get('id'); // Obtener dinámicamente el id de la ruta

    if (!idViaje) {
      console.log('ID de viaje no proporcionado en la ruta.');
      this.router.navigate(['/']);
      return of(false);
    }

    return this.authServicio.user$.pipe(
      switchMap((user) => {
        if (!user) {
          console.log('SIN USUARIO....');  // Usuario no autenticado
          this.router.navigate(['/login']);
          return of(false);
        }

        // Verificar si el usuario tiene acceso al viaje
        return from(this.viajeService.obtenerPorId(idViaje)).pipe(
          map((viajeData: any) => {
            if (viajeData && viajeData.activo && viajeData.conductorEmail === user.email) {
              return true; // El conductor tiene acceso
            } else {
              console.log('Acceso denegado: el viaje no está asignado al usuario.');
              this.router.navigate(['/']);
              return false;
            }
          }),
          catchError((error) => {
            console.error('Error al obtener los datos del viaje:', error);
            this.router.navigate(['/']);
            return of(false);
          })
        );
      }),
      catchError((error) => {
        console.error('Error al obtener el usuario autenticado:', error);
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}
