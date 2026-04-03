import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, interval } from 'rxjs';
import { map, catchError, tap, switchMap, takeWhile } from 'rxjs/operators';
import { Usuario, UserRole } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3001/api/auth/login';
  private usersUrl = 'http://localhost:3001/api/users';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthentication());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private userStatusCheckInterval: any;

  constructor(private http: HttpClient) {
    // Verificar autenticación al inicializar el servicio
    this.isAuthenticatedSubject.next(this.checkAuthentication());

    // Iniciar verificación periódica del estado del usuario si está logueado
    if (this.checkAuthentication()) {
      this.startUserStatusCheck();
    }
  }

  login(username: string, password: string): Observable<boolean> {
    const loginData = { username, password };

    return this.http.post<any>(this.apiUrl, loginData).pipe(
      map((response) => {
        if (response && response.user && response.message === 'Login exitoso') {
          const user = response.user;
          const role = response.role;

          // Generar token temporal si no existe
          const token = user.token || 'fake-jwt-token-' + user.id;

          // Guardar datos de autenticación
          this.setAuthData(token, user.role, user.id, user.username);
          this.isAuthenticatedSubject.next(true);

          // Iniciar verificación periódica después del login exitoso
          this.startUserStatusCheck();
          return true;
        }
        return false;
      }),
      catchError((error) => {
        console.error('Error en login:', error);
        return of(false);
      })
    );
  }

  register(username: string, password: string, role: UserRole): Observable<boolean> {
    const newUser: Usuario = {
      id: Date.now(),
      username,
      password,
      role,
      token: 'fake-jwt-token-' + Date.now(),
      habilitado: true
    };
    return this.http.post<Usuario>(this.apiUrl, newUser).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Error en registro:', error);
        return of(false);
      })
    );
  }

  private setAuthData(token: string, role: UserRole | string, userId: number, username: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role as string);
      localStorage.setItem('userId', userId.toString());
      localStorage.setItem('username', username);
    }
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
    }
    // Detener verificación de estado
    this.stopUserStatusCheck();
    // Emitir cambio de autenticación
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Iniciar verificación periódica del estado del usuario (cada 5 minutos)
   */
  private startUserStatusCheck() {
    if (this.userStatusCheckInterval) {
      clearInterval(this.userStatusCheckInterval);
    }

    this.userStatusCheckInterval = setInterval(() => {
      this.checkCurrentUserStatus();
    }, 5 * 60 * 1000); // 5 minutos
  }

  /**
   * Detener verificación periódica
   */
  private stopUserStatusCheck() {
    if (this.userStatusCheckInterval) {
      clearInterval(this.userStatusCheckInterval);
      this.userStatusCheckInterval = null;
    }
  }

  /**
   * Verificar estado actual del usuario logueado
   */
  private checkCurrentUserStatus() {
    const userId = localStorage.getItem('userId');
    if (!userId || !this.isAuthenticated()) {
      return;
    }

    this.http.get<Usuario>(`${this.usersUrl}/${userId}`).subscribe({
      next: (user) => {
        if (!user || user.activo === false || user.habilitado === false) {
          console.warn('Usuario desactivado o eliminado, cerrando sesión...');
          this.logout();
          // Redirigir al login (esto debería manejarse en el componente)
          window.location.href = '/auth/login?message=Su cuenta ha sido desactivada';
        }
      },
      error: (error) => {
        console.error('Error verificando estado del usuario:', error);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.checkAuthentication();
  }

  private checkAuthentication(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  getRole(): UserRole | string | null {
    if (typeof localStorage === 'undefined') return null;
    const role = localStorage.getItem('role');
    return role || null;
  }

  getUsername(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('username');
  }

  hasRole(role: UserRole): boolean {
    if (typeof localStorage === 'undefined') return false;
    return this.getRole() === role;
  }

  hasAnyRole(roles: (UserRole | string)[]): boolean {
    if (typeof localStorage === 'undefined') return false;
    const userRole = this.getRole();
    return userRole ? roles.includes(userRole) : false;
  }
}
