import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AlertType = 'success' | 'error' | 'warning' | 'info';
export type AlertResult = 'confirm' | 'cancel' | 'auto';

export interface AlertOptions {
  type: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  backdropClose?: boolean;
  navigateAfterClose?: string | any[];
  navigateDelayMs?: number;     // default 300
  autoCloseMs?: number;         // opcional
}

export interface AlertState extends Required<Pick<AlertOptions,
  'type' | 'title' | 'message' | 'backdropClose' | 'navigateDelayMs'
>> {
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
  autoCloseMs?: number;
  navigateAfterClose?: string | any[];
  resolver?: (r: AlertResult) => void;
}

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private queue: AlertState[] = [];
  private current: AlertState | null = null;

  private stateSub = new BehaviorSubject<AlertState | null>(null);
  state$ = this.stateSub.asObservable();

  open(opts: AlertOptions): Promise<AlertResult> {
    const state: AlertState = {
      type: opts.type,
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText ?? 'Entendido',
      cancelText: opts.cancelText ?? 'Cancelar',
      showCancel: !!opts.showCancel,
      backdropClose: opts.backdropClose ?? true,
      navigateAfterClose: opts.navigateAfterClose,
      navigateDelayMs: opts.navigateDelayMs ?? 300,
      autoCloseMs: opts.autoCloseMs,
      resolver: undefined
    };

    const p = new Promise<AlertResult>(res => (state.resolver = res));
    this.queue.push(state);
    this.pump();
    return p;
  }

  /** Llamado por el componente al cerrar */
  _resolve(result: AlertResult): void {
    if (this.current?.resolver) this.current.resolver(result);
    this.current = null;
    this.stateSub.next(null);
    // Siguiente en la cola
    setTimeout(() => this.pump(), 0);
  }

  // ---- internos ----
  private pump() {
    if (!this.current && this.queue.length) {
      this.current = this.queue.shift() ?? null;
      this.stateSub.next(this.current);
    }
  }
}
