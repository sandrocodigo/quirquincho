import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacidad',

  templateUrl: './privacidad.component.html',
  styleUrl: './privacidad.component.scss',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule,],
})
export class PrivacidadComponent {

  email='soporte@torisimo.com';

}
