import { Routes } from '@angular/router';
import { EgresoDetalleComponent } from './egreso-detalle/egreso-detalle.component';
import { EgresoListaComponent } from './egreso-lista/egreso-lista.component';
import { EgresosComponent } from './egresos.component';
import { EgresoNuevoComponent } from './egreso-nuevo/egreso-nuevo.component';
import { EgresoTemporalComponent } from './egreso-temporal/egreso-temporal.component';

export default [
    {
        path: '',
        component: EgresosComponent,
        children: [
            { path: '', component: EgresoListaComponent },
            { path: 'detalle/:id', component: EgresoDetalleComponent },
            { path: 'nuevo/:id', component: EgresoNuevoComponent },
            { path: 'temporal/:id', component: EgresoTemporalComponent },
        ]
    },
] as Routes;