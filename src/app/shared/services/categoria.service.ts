import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private apiUrl = 'http://localhost:3001/api/categorias';

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}?habilitado=true`);
  }

  obtenerPorId(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  crear(categoria: Categoria): Observable<Categoria> {
    const nuevaCategoria = {
      ...categoria,
      habilitado: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.http.post<Categoria>(this.apiUrl, nuevaCategoria);
  }

  actualizar(id: number, categoria: Categoria): Observable<Categoria> {
    const categoriaActualizada = {
      ...categoria,
      updatedAt: new Date().toISOString()
    };
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoriaActualizada);
  }

  eliminar(id: number): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.apiUrl}/${id}`, {
      habilitado: false,
      fechaDeshabilitado: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}
