import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private apiUrl = 'http://localhost:3000/clientes';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  crear(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  actualizar(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  buscar(nombre: string, telefono: string): Observable<Cliente[]> {
    let url = this.apiUrl;
    const params: string[] = [];

    if (nombre) {
      params.push(`nombre_like=${nombre}`);
    }
    if (telefono) {
      params.push(`telefono_like=${telefono}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<Cliente[]>(url);
  }
}
