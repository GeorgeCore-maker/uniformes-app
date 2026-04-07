import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, fromEvent, merge, timer, Observable, BehaviorSubject, interval } from 'rxjs';
import { debounceTime, tap, switchMap, takeWhile } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos
  private readonly WARNING_TIME = 30 * 1000; // Advertir 30 segundos antes
  private inactivityTimer: any;
  private warningTimer: any;
  private userActivity$ = new Subject<void>();
  private isMonitoring = false;
  private lastActivityTime: number = Date.now();
  private timeRemainingSubject = new BehaviorSubject<number>(this.INACTIVITY_TIMEOUT);
  public timeRemaining$ = this.timeRemainingSubject.asObservable();
  private countdownInterval: any;

  // Eventos a monitorear para detectar actividad del usuario
  private readonly ACTIVITY_EVENTS = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private ngZone: NgZone
  ) {}

  /**
   * Iniciar monitoreo de inactividad
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.lastActivityTime = Date.now();
    this.setupActivityListeners();
    this.startCountdown();
    this.resetTimers();
  }

  /**
   * Detener monitoreo de inactividad
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.clearTimers();
    this.stopCountdown();
    this.userActivity$.complete();
    this.userActivity$ = new Subject<void>();
    this.timeRemainingSubject.next(this.INACTIVITY_TIMEOUT);
  }

  /**
   * Configurar listeners para eventos de actividad del usuario
   */
  private setupActivityListeners(): void {
    // Ejecutar fuera de Angular zone para mejor rendimiento
    this.ngZone.runOutsideAngular(() => {
      // Crear observables para cada tipo de evento
      const activityObservables = this.ACTIVITY_EVENTS.map(eventName =>
        fromEvent(document, eventName)
      );

      // Combinar todos los eventos en un solo observable
      merge(...activityObservables)
        .pipe(
          debounceTime(500), // Evitar exceso de eventos
          tap(() => {
            // Volver a Angular zone para ejecutar lógica de la app
            this.ngZone.run(() => {
              this.onUserActivity();
            });
          })
        )
        .subscribe();
    });
  }

  /**
   * Manejar actividad del usuario
   */
  private onUserActivity(): void {
    if (!this.isMonitoring) {
      return;
    }

    // Actualizar tiempo de última actividad
    this.lastActivityTime = Date.now();

    // Reiniciar temporizadores
    this.resetTimers();
  }

  /**
   * Iniciar contador regresivo
   */
  private startCountdown(): void {
    this.stopCountdown();

    this.countdownInterval = setInterval(() => {
      const elapsed = Date.now() - this.lastActivityTime;
      const remaining = Math.max(0, this.INACTIVITY_TIMEOUT - elapsed);
      this.timeRemainingSubject.next(remaining);

      if (remaining === 0) {
        this.stopCountdown();
      }
    }, 1000); // Actualizar cada segundo
  }

  /**
   * Detener contador regresivo
   */
  private stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  /**
   * Reiniciar temporizadores de inactividad
   */
  private resetTimers(): void {
    this.clearTimers();

    // Actualizar tiempo de última actividad
    this.lastActivityTime = Date.now();
    this.timeRemainingSubject.next(this.INACTIVITY_TIMEOUT);

    // Timer para advertencia (4.5 minutos)
    this.warningTimer = setTimeout(() => {
      this.showInactivityWarning();
    }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

    // Timer para logout automático (5 minutos)
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Limpiar temporizadores
   */
  private clearTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Mostrar advertencia de inactividad
   */
  private showInactivityWarning(): void {
    this.notificationService.warning(
      'Tu sesión expirará en 30 segundos por inactividad',
      { duration: 5000 }
    );
  }

  /**
   * Manejar timeout por inactividad
   */
  private handleInactivityTimeout(): void {
    this.notificationService.warning(
      'Sesión cerrada por inactividad'
    );

    // Detener monitoreo
    this.stopMonitoring();

    // Cerrar sesión
    this.authService.logout();

    // Redirigir a login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verificar si el monitoreo está activo
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Obtener tiempo máximo de inactividad
   */
  getMaxInactivityTime(): number {
    return this.INACTIVITY_TIMEOUT;
  }
}
