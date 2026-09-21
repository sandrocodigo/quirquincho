import { afterNextRender, Component, inject, Injector } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { filter, take } from 'rxjs/operators';

import { SpinnerOverlayComponent } from './aplicacion/sistema/spinner/spinner-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpinnerOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);

  constructor() {
    // isStable puede emitirse antes de cargar la ruta inicial y resolver sus guards.
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      take(1),
      takeUntilDestroyed()
    ).subscribe(() => {
      // Esperar también al render de la pantalla que acaba de activarse.
      afterNextRender({
        write: () => {
          const splashElement = this.document.getElementById('app-splash-screen');
          if (!splashElement) return;

          splashElement.classList.add('fade-out');
          setTimeout(() => splashElement.remove(), 600);
        }
      }, { injector: this.injector });
    });
  }
}
