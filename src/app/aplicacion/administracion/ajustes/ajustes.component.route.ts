import { Routes } from '@angular/router';
import { AjustesComponent } from './ajustes.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { MantenimientosComponent } from './mantenimientos/mantenimientos.component';


export default [
    {
        path: '',
        component: AjustesComponent,
        children: [
            { path: '', component: UsuariosComponent},
            { path: 'usuarios',component: UsuariosComponent},
            { path: 'planes', loadChildren: () => import('./planes/planes.component.route') },


            { path: 'mantenimientos',component: MantenimientosComponent},
        ]
    },
] as Routes;