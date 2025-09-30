import { Routes } from '@angular/router';
import { SitioComponent } from './sitio.component';
import { InicioComponent } from './inicio/inicio.component';
import { ContactoComponent } from './contacto/contacto.component';
import { ViajesComponent } from './viajes/viajes.component';
import { PrivacidadComponent } from './privacidad/privacidad.component';
import { CondicionesComponent } from './condiciones/condiciones.component';
/* import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['/']); */

export default [
    {
        path: '',
        component: SitioComponent,
        children: [
            { path: '', component: InicioComponent, },
            { path: 'inicio', component: InicioComponent, },
            { path: 'contacto', component: ContactoComponent, },
            { path: 'viajes', component: ViajesComponent, },
            { path: 'privacidad', component: PrivacidadComponent, },
            { path: 'privacicion', component: PrivacidadComponent, },
            { path: 'condiciones', component: CondicionesComponent, }
            /*             { path: '', loadChildren: () => import('./inicio/inicio.component.route'), },
                        { path: 'productos', loadChildren: () => import('./productos/productos.component.route'), },
                        { path: 'servicios', loadChildren: () => import('./servicios/servicios.component.route'), },
                        // { path: 'productos', loadChildren: () => import('./productos/productos.component.route'), },
                        // { path: 'publicaciones', loadChildren: () => import('./publicaciones/publicaciones.component.route'), },
                        //{ path: 'proyectos', loadChildren: () => import('./proyectos/proyectos.component.route'), ...canActivate(redirectUnauthorizedToLogin), },
                        //          { path: 'notificaciones', loadChildren: () => import('./notificaciones/notificaciones.component.route'), ...canActivate(redirectUnauthorizedToLogin), },
                        { path: 'contacto', loadChildren: () => import('./contacto/contacto.component.route'), },
                        // { path: 'invitaciones', component: InvitacionesComponent, ...canActivate(redirectUnauthorizedToLogin), }, */
        ]
    },
] as Routes;