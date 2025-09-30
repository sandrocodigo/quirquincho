// src/app/shared/spinner/spinner-overlay.component.ts
import { Component, computed, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerService } from './spinner.service';

@Component({
  selector: 'app-spinner-overlay',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  styles: [`
    .overlay {
      position: fixed; inset: 0; z-index: 9999;
      display: grid; place-items: center;
      background: rgba(0,0,0,.4);
    }
    .card { display:flex; gap:.75rem; align-items:center; color:#fff; }
  `],
  template: `
    @if (visible()) {
      <div class="overlay">
        <div class="card">
          <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
          <div>{{ message() }}</div>
        </div>
      </div>
    }
  `
})
export class SpinnerOverlayComponent {
  private svc = inject(SpinnerService);
  visible = computed(() => this.svc.visible());
  message = computed(() => this.svc.message());
}
