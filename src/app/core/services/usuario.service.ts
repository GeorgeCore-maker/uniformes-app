import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los usuarios
   */
  obtenerTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
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
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  /**
   * Actualizar usuario existente
   */
  actualizar(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  /**
   * Eliminar usuario
   */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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
    return this.http.patch<Usuario>(`${this.apiUrl}/${usuarioId}`, { activo });
  }
}
