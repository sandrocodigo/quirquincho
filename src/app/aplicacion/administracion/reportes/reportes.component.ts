import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

// MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';



@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatIconModule, MatButtonModule, MatDividerModule, MatMenuModule, RouterModule],
})
export class ReportesComponent {
  menuReportes = [
    { link: 'reporte1', icon: 'inventory', label: '1: Inventario Físico' },
    { link: 'reporte2', icon: 'add_box', label: '2: Ingresos' },
    { link: 'reporte3', icon: 'indeterminate_check_box', label: '3: Egresos' },
    { link: 'reporte4', icon: 'settings', label: '4: Ordenes' },
    { link: 'reporte5', icon: 'settings', label: '5: Saldo Minimo' },
    { link: 'reporte6', icon: 'settings', label: '6: Egresos de Ordenes' },
    { link: 'reporte7', icon: 'settings', label: '7: Reporte' },
    { link: 'reporte8', icon: 'settings', label: '8: Reporte' },
    { link: 'reporte9', icon: 'settings', label: '9: Reporte' },
    { link: 'reporte10', icon: 'settings', label: '10: Reporte' },
  ];
}
