import { Routes } from '@angular/router';

import { ArchivosComponent } from './archivos.component';

import { ArchivoComponent } from './archivo/archivo.component'

export default [
    {
        path: '',
        component: ArchivosComponent,
        children: [
            { path: '', component: ArchivoComponent},
        ]
    },
] as Routes;