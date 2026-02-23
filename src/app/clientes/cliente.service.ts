import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private apiUrl = 'http://localhost:3000/clientes';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}?habilitado=true`);
  }

  obtenerPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  crear(cliente: Cliente): Observable<Cliente> {
    const nuevoCliente = {
      ...cliente,
      habilitado: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.http.post<Cliente>(this.apiUrl, nuevoCliente);
  }

  actualizar(id: number, cliente: Cliente): Observable<Cliente> {
    const clienteActualizado = {
      ...cliente,
      updatedAt: new Date().toISOString()
    };
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, clienteActualizado);
  }

  eliminar(id: number): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}`, {
      habilitado: false,
      fechaDeshabilitado: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  buscar(nombre: string, telefono: string): Observable<Cliente[]> {
    let url = `${this.apiUrl}?habilitado=true`;

    if (nombre) {
      url += `&nombre_like=${nombre}`;
    }
    if (telefono) {
      url += `&telefono_like=${telefono}`;
    }

    return this.http.get<Cliente[]>(url);
  }
}
