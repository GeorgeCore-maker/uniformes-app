import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol, Usuario } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class RolService {
  private apiUrl = 'http://localhost:3000/roles';
  private usersUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los roles habilitados
   */
  obtenerTodos(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}?habilitado=true`);
  }

  /**
   * Obtener rol por ID
   */
  obtenerPorId(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nuevo rol
   */
  crear(rol: Rol): Observable<Rol> {
    const nuevoRol = {
      ...rol,
      habilitado: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.http.post<Rol>(this.apiUrl, nuevoRol);
  }

  /**
   * Actualizar rol existente
   */
  actualizar(id: number, rol: Rol): Observable<Rol> {
    const rolActualizado = {
      ...rol,
      habilitado: true,
      updatedAt: new Date().toISOString()
    };
    return this.http.put<Rol>(`${this.apiUrl}/${id}`, rolActualizado);
  }

  /**
   * Eliminar rol (Borrado lógico - marca como deshabilitado)
   */
  eliminar(id: number): Observable<Rol> {
    return this.http.patch<Rol>(`${this.apiUrl}/${id}`, {
      habilitado: false,
      fechaDeshabilitado: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Obtener todos los usuarios
   */
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.usersUrl);
  }

  /**
   * Actualizar rol de usuario
   */
  asignarRolAUsuario(usuarioId: number, rol: string | number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.usersUrl}/${usuarioId}`, { role: rol });
  }

  /**
   * Rol predefinido - Permisos disponibles
   */
  getPermisosDisponibles(): string[] {
    return [
      'Ver Dashboard',
      'Gestionar Clientes',
      'Gestionar Productos',
      'Gestionar Pedidos',
      'Ver Producción',
      'Gestionar Producción',
      'Ver Inventario',
      'Gestionar Inventario',
      'Gestionar Usuarios',
      'Gestionar Roles',
      'Ver Reportes',
      'Exportar Datos'
    ];
  }
}
