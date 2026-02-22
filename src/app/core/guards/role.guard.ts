import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { UserRole } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requiredRoles: (UserRole | string)[] = route.data['roles'] || [];
    const userRole = this.authService.getRole();

    // Si no hay roles requeridos, permitir acceso
    if (requiredRoles.length === 0) {
      return true;
    }

    // Verificar si el rol del usuario está en los roles permitidos
    if (!userRole || !requiredRoles.includes(userRole)) {
      console.warn(`Acceso denegado. Rol requerido: ${requiredRoles.join(', ')}, Rol actual: ${userRole}`);
      this.router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }
}
