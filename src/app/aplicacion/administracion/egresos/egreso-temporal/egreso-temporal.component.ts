import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-egreso-temporal',
  imports: [CommonModule, RouterModule,],
  templateUrl: './egreso-temporal.component.html',
  styleUrl: './egreso-temporal.component.scss'
})
export class EgresoTemporalComponent {
  idEgreso: any;

  constructor(
    private ruta: ActivatedRoute,
    public router: Router,
  ) {
    this.idEgreso = this.ruta.snapshot.paramMap.get('id');
    this.router.navigate(['/administracion/egresos/venta/' + this.idEgreso]);
  }

}
