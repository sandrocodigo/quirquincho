import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinnerOverlayComponent } from './aplicacion/sistema/spinner/spinner-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpinnerOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('quirquincho');
}
