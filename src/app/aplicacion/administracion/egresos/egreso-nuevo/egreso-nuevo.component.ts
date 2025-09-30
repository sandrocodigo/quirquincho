import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-egreso-nuevo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './egreso-nuevo.component.html',
  styleUrl: './egreso-nuevo.component.scss'
})
export class EgresoNuevoComponent {

  idEgreso: any;
  error: any;
  constructor(
    public router: Router,
    private ruta: ActivatedRoute,
  ) {
    this.idEgreso = this.ruta.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.idEgreso) {
      this.router.navigate(['/administracion/egresos/detalle/' + this.idEgreso]);
    } else {
      this.error = 'Ocurrio un error al crear egreso';
    }
  }
}
