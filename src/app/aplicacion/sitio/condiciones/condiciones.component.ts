import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-condiciones',
  templateUrl: './condiciones.component.html',
  styleUrl: './condiciones.component.scss',
      standalone: true,
      imports: [RouterModule, MatIconModule, MatButtonModule,],
})
export class CondicionesComponent {
  email='soporte@torisimo.com';
}
