import { Routes } from '@angular/router';
import { BuscadoresComponent } from './buscadores.component';
import { BuscadorProductoComponent } from './buscador-producto/buscador-producto.component';

export default [
    {
        path: '',
        component: BuscadoresComponent,
        children: [
            { path: '', component: BuscadorProductoComponent},
        ]
    },
] as Routes;