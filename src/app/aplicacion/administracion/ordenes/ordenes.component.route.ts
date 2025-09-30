import { Routes } from '@angular/router';
import { OrdenesComponent } from './ordenes.component';
import { OrdenListaComponent } from './orden-lista/orden-lista.component';
import { OrdenDetalleComponent } from './orden-detalle/orden-detalle.component';
import { OrdenTemporalComponent } from './orden-temporal/orden-temporal.component';


export default [
    {
        path: '',
        component: OrdenesComponent,
        children: [
            { path: '', component: OrdenListaComponent },
            {
                path: 'detalle/:id',
                component: OrdenDetalleComponent,
            },
            { path: 'temporal/:id', component: OrdenTemporalComponent },
        ]
    },
] as Routes;