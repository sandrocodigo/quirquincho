import { Routes } from '@angular/router';
import { ViajesComponent } from './viajes.component';
import { ViajeListaComponent } from './viaje-lista/viaje-lista.component';
import { ViajeDetalleComponent } from './viaje-detalle/viaje-detalle.component';

export default [
    {
        path: '',
        component: ViajesComponent,
        children: [
            { path: '', component: ViajeListaComponent },
            {
                path: 'detalle/:id',
                component: ViajeDetalleComponent,
            },
        ]
    },
] as Routes;