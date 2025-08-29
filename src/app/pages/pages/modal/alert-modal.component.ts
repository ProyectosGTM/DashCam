import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertsService, AlertResult, AlertState, AlertType } from './alerts.service';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertModalComponent {
  state: AlertState | null = null;
  open = false;
  closing = false;

  private autoTimer: any = null;
  private prevOverflow = '';
  private navPending = false;
  private _lastResult: AlertResult | null = null;

iconPath = {
  success: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
  error:   'M18.3 5.71 16.88 4.29 10.59 10.59 4.29 4.29 2.87 5.71 9.17 12 2.87 18.29 4.29 19.71 10.59 13.41 16.88 19.71 18.3 18.29 12 12z',
  warning: 'M12 2 2 22h20L12 2zm1 15h-2v-2h2v2zm0-4h-2V8h2v5z',
  // círculo más grande pero con grosor medio y “i” estilizada
  info:    'M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5ZM11 7h2v2h-2V7Zm0 4h2v7h-2v-7Z'
} as const;




  get iconD(): string {
    const t: AlertType = (this.state?.type ?? 'info') as AlertType;
    return this.iconPath[t];
  }

  constructor(private alerts: AlertsService, private router: Router, private cdr: ChangeDetectorRef) {
    this.alerts.state$.subscribe(s => {
      if (!s) return;
      this.state = s;
      this.open = true;
      this.closing = false;
      this.lockScroll();

      if (this.autoTimer) clearTimeout(this.autoTimer);
      if (s.autoCloseMs && s.autoCloseMs > 0) {
        this.autoTimer = setTimeout(() => this.close('auto'), s.autoCloseMs);
      }
      // OnPush: marcamos para render
      this.cdr.markForCheck();
    });
  }

  onBackdrop() {
    if (this.closing || !this.state) return;
    if (this.state.backdropClose) this.close('cancel');
  }

  confirm() { this.close('confirm'); }
  cancel()  { this.close('cancel');  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.open || this.closing) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close('cancel');
    }
  }

onAnimEnd(e: AnimationEvent) {
  if (!this.closing) return;
  if (e.animationName === 'am-pop-out' || e.animationName === 'am-fade-out') {
    if (this.closeFallback) { clearTimeout(this.closeFallback); this.closeFallback = null; }
    this.finalizeClose();
  }
}

// añade este método
private finalizeClose() {
  if (!this.closing) return;
  this.open = false;
  this.closing = false;
  this.unlockScroll();

  const target = this.state?.navigateAfterClose;
  if (target && !this.navPending) {
    this.navPending = true;
    const delay = this.state!.navigateDelayMs ?? 300;
    setTimeout(() => {
      Array.isArray(target) ? this.router.navigate(target) : this.router.navigate([target]);
      this.navPending = false;
    }, delay);
  }

  this.alerts._resolve(this._lastResult as AlertResult);
  this._lastResult = null;
  this.state = null;
  this.cdr.detectChanges();
}

private closeFallback: any = null;

// reemplaza tu close(...)
private close(reason: AlertResult) {
  if (!this.state || this.closing) return;
  this._lastResult = reason;
  this.closing = true;
  this.cdr.markForCheck();

  // Fallback por si no se emite animationend
  if (this.closeFallback) clearTimeout(this.closeFallback);
  this.closeFallback = setTimeout(() => this.finalizeClose(), 260); // > 0.18s
}

  private lockScroll() {
    this.prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  private unlockScroll() {
    document.body.style.overflow = this.prevOverflow || '';
  }
}
