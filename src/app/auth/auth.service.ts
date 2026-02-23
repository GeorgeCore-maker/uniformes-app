import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Usuario, UserRole } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthentication());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar autenticación al inicializar el servicio
    this.isAuthenticatedSubject.next(this.checkAuthentication());
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.get<Usuario[]>(this.apiUrl).pipe(
      map((users) => {
        if (users && users.length > 0) {
          const user = users.find(u => u.username === username && u.password === password);
          if (user) {
            const token = user.token || 'fake-jwt-token-' + user.id;
            this.setAuthData(token, user.role, user.id, user.username);
            this.isAuthenticatedSubject.next(true);
            return true;
          }
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
    // Emitir cambio de autenticación
    this.isAuthenticatedSubject.next(false);
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
