import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-orden-temporal',
  imports: [CommonModule, RouterModule,],
  templateUrl: './orden-temporal.component.html',
  styleUrl: './orden-temporal.component.scss'
})
export class OrdenTemporalComponent {
  id: any;

  constructor(
    private ruta: ActivatedRoute,
    public router: Router,
  ) {
    this.id = this.ruta.snapshot.paramMap.get('id');
    this.router.navigate(['/administracion/ordenes/detalle/' + this.id]);
  }
}
