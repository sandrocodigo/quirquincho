import { Routes } from '@angular/router';
import { AsignacionesComponent } from './asignaciones.component';
import { AsignacionListaComponent } from './asignacion-lista/asignacion-lista.component';
import { AsignacionDetalleComponent } from './asignacion-detalle/asignacion-detalle.component';


export default [
    {
        path: '',
        component: AsignacionesComponent,
        children: [
            { path: '', component: AsignacionListaComponent },
            {
                path: 'detalle/:id',
                component: AsignacionDetalleComponent,
            },
        ]
    },
] as Routes;