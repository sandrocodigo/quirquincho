import { Routes } from '@angular/router';
import { DocumentosComponent } from './documentos.component';
import { DocumentoListaComponent } from './documento-lista/documento-lista.component';


export default [
    {
        path: '',
        component: DocumentosComponent,
        children: [
            { path: '', component: DocumentoListaComponent },
/*             {
                path: 'detalle/:id',
                component: AsignacionDetalleComponent,
            }, */
        ]
    },
] as Routes;