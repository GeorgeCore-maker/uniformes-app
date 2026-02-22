import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationConfig extends MatSnackBarConfig {
  tipo?: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly DEFAULT_DURATION = 4000; // 4 segundos

  constructor(
    private snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {}

  /**
   * Mostrar notificación de éxito
   */
  success(mensaje: string, config?: NotificationConfig): void {
    this.mostrar(mensaje, {
      ...config,
      panelClass: ['notification-success'],
      tipo: 'success'
    });
  }

  /**
   * Mostrar notificación de error
   */
  error(mensaje: string, config?: NotificationConfig): void {
    this.mostrar(mensaje, {
      ...config,
      panelClass: ['notification-error'],
      duration: config?.duration || this.DEFAULT_DURATION * 1.5, // Más tiempo para errores
      tipo: 'error'
    });
  }

  /**
   * Mostrar notificación de advertencia
   */
  warning(mensaje: string, config?: NotificationConfig): void {
    this.mostrar(mensaje, {
      ...config,
      panelClass: ['notification-warning'],
      tipo: 'warning'
    });
  }

  /**
   * Mostrar notificación de información
   */
  info(mensaje: string, config?: NotificationConfig): void {
    this.mostrar(mensaje, {
      ...config,
      panelClass: ['notification-info'],
      tipo: 'info'
    });
  }

  /**
   * Mostrar notificación genérica
   */
  private mostrar(mensaje: string, config: NotificationConfig = {}): void {
    const configFinal: MatSnackBarConfig = {
      duration: this.DEFAULT_DURATION,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [],
      ...config
    };

    // Ejecutar dentro de Angular zone para asegurar detección de cambios
    this.ngZone.run(() => {
      this.snackBar.open(mensaje, 'Cerrar', configFinal);
    });
  }

  /**
   * Cerrar todas las notificaciones
   */
  cerrarTodas(): void {
    this.snackBar.dismiss();
  }
}
