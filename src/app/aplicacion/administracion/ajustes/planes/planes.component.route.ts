import { Routes } from '@angular/router';
import { PlanesComponent } from './planes.component';
import { PlanListaComponent } from './plan-lista/plan-lista.component';

export default [
    {
        path: '',
        component: PlanesComponent,
        children: [
            { path: '', component: PlanListaComponent},
        ]
    },
] as Routes;