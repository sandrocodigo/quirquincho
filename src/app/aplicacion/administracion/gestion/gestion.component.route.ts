import { Routes } from '@angular/router';
import { GestionComponent } from './gestion.component';
import { GestionIngresoComponent } from './gestion-ingreso/gestion-ingreso.component';

import { GestionBuscar } from './gestion-buscar/gestion-buscar';
import { GestionProductoComponent } from './gestion-producto/gestion-producto.component';
import { GestionEgreso } from './gestion-egreso/gestion-egreso';

export default [
    {
        path: '',
        component: GestionComponent,
        children: [
            { path: '', component: GestionIngresoComponent },
            { path: 'ingresos', component: GestionIngresoComponent },
            { path: 'egresos', component: GestionEgreso},

            { path: 'productos', component: GestionProductoComponent },
            { path: 'buscar', component: GestionBuscar },
        ]
    },
] as Routes;