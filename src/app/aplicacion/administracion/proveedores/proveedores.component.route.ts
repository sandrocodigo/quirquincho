import { Routes } from '@angular/router';
import { ProveedoresComponent } from './proveedores.component';
import { ProveedorListaComponent } from './proveedor-lista/proveedor-lista.component';

export default [
    {
        path: '',
        component: ProveedoresComponent,
        children: [
            { path: '', component: ProveedorListaComponent },
        ]
    },
] as Routes;