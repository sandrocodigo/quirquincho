import { Routes } from '@angular/router';
import { ProductosComponent } from './productos.component';
import { ProductoListaComponent } from './producto-lista/producto-lista.component';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle.component';

export default [
    {
        path: '',
        component: ProductosComponent,
        children: [
            { path: '', component: ProductoListaComponent},
            { path: 'detalle/:id', component: ProductoDetalleComponent},
        ]
    },
] as Routes;