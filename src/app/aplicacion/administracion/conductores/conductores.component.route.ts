import { Routes } from '@angular/router';
import { ConductoresComponent } from './conductores.component';
import { ConductorListaComponent } from './conductor-lista/conductor-lista.component';

export default [
    {
        path: '',
        component: ConductoresComponent,
        children: [
            { path: '', component: ConductorListaComponent },
/*             {
                path: 'detalle/:id',
                component: AsignacionDetalleComponent,
            }, */
        ]
    },
] as Routes;