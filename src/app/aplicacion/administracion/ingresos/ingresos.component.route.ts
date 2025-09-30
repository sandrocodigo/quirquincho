import { Routes } from '@angular/router';
import { IngresosComponent } from './ingresos.component';
import { IngresoListaComponent } from './ingreso-lista/ingreso-lista.component';
import { IngresoDetalleComponent } from './ingreso-detalle/ingreso-detalle.component';
import { IngresoItemsComponent } from './ingreso-items/ingreso-items.component';

export default [
    {
        path: '',
        component: IngresosComponent,
        children: [
            { path: '', component: IngresoListaComponent},
            { path: 'detalle/:id', component: IngresoDetalleComponent},
            { path: 'items/:id', component: IngresoItemsComponent},
        ]
    },
] as Routes;