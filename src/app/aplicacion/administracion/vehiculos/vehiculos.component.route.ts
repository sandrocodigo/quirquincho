import { Routes } from '@angular/router';
import { VehiculosComponent } from './vehiculos.component';
import { VehiculoListaComponent } from './vehiculo-lista/vehiculo-lista.component';
import { VehiculoDetalleComponent } from './vehiculo-detalle/vehiculo-detalle.component';

export default [
    {
        path: '',
        component: VehiculosComponent,
        children: [
            { path: '', component: VehiculoListaComponent },
            { path: 'detalle/:id', component: VehiculoDetalleComponent },
        ]
    },
] as Routes;