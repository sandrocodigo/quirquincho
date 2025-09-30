import { Routes } from '@angular/router';
import { TarifasComponent } from './tarifas.component';
import { TarifaListaComponent } from './tarifa-lista/tarifa-lista.component';

export default [
    {
        path: '',
        component: TarifasComponent,
        children: [
            { path: '', component: TarifaListaComponent },

        ]
    },
] as Routes;