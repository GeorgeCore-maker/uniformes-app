import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Usuario } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:3001/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los usuarios habilitados
   */
  obtenerTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}`);
  }

  /**
   * Obtener usuario por ID
   */
  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nuevo usuario
   */
  crear(usuario: Usuario): Observable<Usuario> {
    const nuevoUsuario = {
      ...usuario,
      habilitado: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.http.post<Usuario>(this.apiUrl, nuevoUsuario);
  }

  /**
   * Actualizar usuario existente
   */
  actualizar(id: number, usuario: Usuario): Observable<Usuario> {
    const usuarioActualizado = {
      ...usuario,
      updatedAt: new Date().toISOString()
    };
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuarioActualizado);
  }

  /**
   * Eliminar usuario (Borrado lógico)
   */
  eliminar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}`, {
      habilitado: false,
      fechaDeshabilitado: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Cambiar rol de usuario
   */
  cambiarRol(usuarioId: number, nuevoRol: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${usuarioId}`, { role: nuevoRol });
  }

  /**
   * Cambiar estado activo/inactivo del usuario
   */
  cambiarEstado(usuarioId: number, activo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${usuarioId}`, {
      activo,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Verificar si un usuario puede acceder al sistema
   */
  puedeAcceder(usuarioId: number): Observable<boolean> {
    return this.obtenerPorId(usuarioId).pipe(
      map(usuario => usuario && usuario.activo !== false && usuario.habilitado !== false),
      catchError(() => of(false))
    );
  }
}
