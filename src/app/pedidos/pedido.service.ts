import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Pedido, EstadoPedido } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private apiUrl = 'http://localhost:3000/pedidos';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  crear(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }

  actualizar(id: number, pedido: Pedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}`, pedido);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerPorEstado(estado: EstadoPedido): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}?estado=${estado}`);
  }

  cambiarEstado(id: number, nuevoEstado: EstadoPedido): Observable<Pedido> {
    return this.obtenerPorId(id).pipe(
      switchMap((pedido) => {
        const actualizado = { ...pedido, estado: nuevoEstado };
        return this.actualizar(id, actualizado);
      })
    );
  }
}
