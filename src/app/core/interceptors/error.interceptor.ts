import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.manejarError(error);
        return throwError(() => error);
      })
    );
  }

  private manejarError(error: HttpErrorResponse): void {
    let mensaje = '';
    let tipo: 'error' | 'warning' = 'error';

    if (error.status === 0) {
      // Error de conexión
      mensaje = 'Error de conexión. Por favor verifica tu conexión a internet.';
    } else if (error.status === 400) {
      // Bad Request
      mensaje = error.error?.mensaje || 'Los datos enviados no son válidos.';
      tipo = 'warning';
    } else if (error.status === 401) {
      // No autorizado
      mensaje = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      this.router.navigate(['/auth/login']);
    } else if (error.status === 403) {
      // Prohibido
      mensaje = 'No tienes permiso para acceder a este recurso.';
    } else if (error.status === 404) {
      // No encontrado
      mensaje = 'El recurso solicitado no fue encontrado.';
    } else if (error.status === 409) {
      // Conflicto
      mensaje = error.error?.mensaje || 'Ya existe un registro con esta información.';
      tipo = 'warning';
    } else if (error.status === 422) {
      // Unprocessable Entity - Errores de validación
      mensaje = error.error?.mensaje || 'Error de validación. Por favor verifica los datos.';
      tipo = 'warning';
    } else if (error.status === 429) {
      // Too Many Requests
      mensaje = 'Has realizado demasiadas solicitudes. Por favor espera un momento.';
    } else if (error.status >= 500) {
      // Error del servidor
      mensaje = 'Error en el servidor. Por favor intenta nuevamente más tarde.';
    } else {
      // Error desconocido
      mensaje = error.message || 'Ocurrió un error inesperado.';
    }

    // Mostrar notificación según el tipo de error
    switch (tipo) {
      case 'warning':
        this.notificationService.warning(mensaje);
        break;
      default:
        this.notificationService.error(mensaje);
    }

    // Log en consola para desarrollo
    console.error('Error HTTP:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      error: error.error
    });
  }
}
