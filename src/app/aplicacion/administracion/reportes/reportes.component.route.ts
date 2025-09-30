import { Routes } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { ReporteComponent } from './reporte/reporte.component';
import { Reporte1Component } from './reporte1/reporte1.component';
import { Reporte2Component } from './reporte2/reporte2.component';
import { Reporte3Component } from './reporte3/reporte3.component';
import { Reporte4Component } from './reporte4/reporte4.component';
import { Reporte5Component } from './reporte5/reporte5.component';
import { Reporte10Component } from './reporte10/reporte10.component';
import { Reporte6Component } from './reporte6/reporte6.component';
import { Reporte7Component } from './reporte7/reporte7.component';
import { Reporte8Component } from './reporte8/reporte8.component';
import { Reporte9Component } from './reporte9/reporte9.component';

export default [
    {
        path: '',
        component: ReportesComponent,
        children: [
            { path: '', component: ReporteComponent},
            { path: 'reporte1', component: Reporte1Component},
            { path: 'reporte2', component: Reporte2Component},
            { path: 'reporte3', component: Reporte3Component},
            { path: 'reporte4', component: Reporte4Component},
            { path: 'reporte5', component: Reporte5Component},
            { path: 'reporte6', component: Reporte6Component},
            { path: 'reporte7', component: Reporte7Component},
            { path: 'reporte8', component: Reporte8Component},
            { path: 'reporte9', component: Reporte9Component},
            { path: 'reporte10', component: Reporte10Component},
        ]
    },
] as Routes;