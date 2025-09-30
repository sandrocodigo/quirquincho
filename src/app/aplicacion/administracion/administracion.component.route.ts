import { Routes } from '@angular/router';
import { AdministracionComponent } from './administracion.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';

export default [
    {
        path: '',
        component: AdministracionComponent,
        children: [
            { path: '', component: EstadisticasComponent },
            { path: 'estadisticas', component: EstadisticasComponent },

            // { path: 'clientes', loadChildren: () => import('./clientes/clientes.component.route') },
            { path: 'vehiculos', loadChildren: () => import('./vehiculos/vehiculos.component.route') },

            { path: 'programaciones', loadChildren: () => import('./programaciones/programaciones.component.route') },
            { path: 'ordenes', loadChildren: () => import('./ordenes/ordenes.component.route') },


            // { path: 'viajes', loadChildren: () => import('./viajes/viajes.component.route') },

            // { path: 'tarifas', loadChildren: () => import('./tarifas/tarifas.component.route') },

            { path: 'ajustes', loadChildren: () => import('./ajustes/ajustes.component.route') },

            { path: 'ingresos', loadChildren: () => import('./ingresos/ingresos.component.route') },
            { path: 'egresos', loadChildren: () => import('./egresos/egresos.component.route') },


            { path: 'archivos', loadChildren: () => import('./archivos/archivos.component.route') },
            { path: 'productos', loadChildren: () => import('./productos/productos.component.route') },


            { path: 'asignaciones', loadChildren: () => import('./asignaciones/asignaciones.component.route') },
            { path: 'documentos', loadChildren: () => import('./documentos/documentos.component.route') },

            { path: 'conductores', loadChildren: () => import('./conductores/conductores.component.route') },

            { path: 'reportes', loadChildren: () => import('./reportes/reportes.component.route') },


            {
                path: 'gestion', loadChildren: () => import('./gestion/gestion.component.route'),
                //canActivate: [AccesoGuard]
            },

            {
                path: 'buscadores', loadChildren: () => import('./buscadores/buscadores.component.route'),
                //canActivate: [AccesoGuard]
            },

            /*             
                        
                        { path: 'proyectos', loadChildren: () => import('./proyectos/proyectos.component.route') },
                        
            
                        { path: 'caja', loadChildren: () => import('./caja/caja.component.route') },
                        { path: 'cotizaciones', loadChildren: () => import('./cotizaciones/cotizaciones.component.route') },
                                  
                        
             */
            //{ path: 'usuarios', loadChildren: () => import('./usuarios/usuarios.component.route') },
            //{ path: 'configuraciones', loadChildren: () => import('./configuraciones/configuraciones.component.route') },
        ]
    },
] as Routes;