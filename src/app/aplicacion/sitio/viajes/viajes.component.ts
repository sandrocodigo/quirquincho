import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-viajes-sitio',
  templateUrl: './viajes.component.html',
  styleUrl: './viajes.component.scss',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule,],
})
export class ViajesComponent {

}
