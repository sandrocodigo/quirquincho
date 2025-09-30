import { Routes } from '@angular/router';
import { ClientesComponent } from './clientes.component';
import { ClienteListaComponent } from './cliente-lista/cliente-lista.component';

export default [
    {
        path: '',
        component: ClientesComponent,
        children: [
            { path: '', component: ClienteListaComponent },
        ]
    },
] as Routes;