import { Routes } from '@angular/router';
import { LoginComponent } from './aplicacion/seguridad/login/login.component';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RegistroComponent } from './aplicacion/seguridad/registro/registro.component';
import { RecuperacionComponent } from './aplicacion/seguridad/recuperacion/recuperacion.component';
import { AdministradorGuard } from './aplicacion/seguridad/adminitrador.guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['/']);

export const routes: Routes = [
    { path: '', loadChildren: () => import('./aplicacion/sitio/sitio.component.route') },

    { path: 'login', component: LoginComponent, ...canActivate(redirectLoggedInToHome) },
    { path: 'registro', component: RegistroComponent, ...canActivate(redirectLoggedInToHome) },
    { path: 'recuperacion', component: RecuperacionComponent, ...canActivate(redirectLoggedInToHome) },

    {
        path: 'administracion',
        loadChildren: () => import('./aplicacion/administracion/administracion.component.route'),
        ...canActivate(redirectUnauthorizedToLogin),
        canActivate: [AdministradorGuard],
    },
];
