import { Routes } from '@angular/router';
import { ProgramacionesComponent } from './programaciones.component';
import { ProgramacionDetalleComponent } from './programacion-detalle/programacion-detalle.component';
import { ProgramacionListaComponent } from './programacion-lista/programacion-lista.component';


export default [
    {
        path: '',
        component: ProgramacionesComponent,
        children: [
            { path: '', component: ProgramacionListaComponent },
            {
                path: 'detalle/:id',
                component: ProgramacionDetalleComponent,
            },
        ]
    },
] as Routes;