import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { UsuarioService } from '../services/usuario.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Verificar si el usuario sigue activo y habilitado
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.authService.logout();
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    return this.usuarioService.obtenerPorId(Number(userId)).pipe(
      map(usuario => {
        if (usuario && usuario.activo !== false && usuario.habilitado !== false) {
          return true;
        } else {
          // Usuario desactivado o eliminado, cerrar sesión
          this.authService.logout();
          this.router.navigate(['/auth/login'], {
            queryParams: {
              returnUrl: state.url,
              message: 'Su cuenta ha sido desactivada. Contacte al administrador.'
            }
          });
          return false;
        }
      }),
      catchError(error => {
        console.error('Error verificando estado del usuario:', error);
        // En caso de error, permitir acceso pero registrar el problema
        return of(true);
      })
    );
  }
}
