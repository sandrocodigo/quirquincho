// src/app/shared/spinner/spinner.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpinnerService {
  private _count = signal(0);
  message = signal<string>('Procesando...'); // texto opcional
  visible = signal(false);

  show(msg?: string) {
    if (msg) this.message.set(msg);
    this._count.update(c => {
      const n = c + 1;
      this.visible.set(n > 0);
      return n;
    });
  }

  hide() {
    this._count.update(c => {
      const n = Math.max(0, c - 1);
      this.visible.set(n > 0);
      return n;
    });
  }

  reset() {
    this._count.set(0);
    this.visible.set(false);
  }
}
