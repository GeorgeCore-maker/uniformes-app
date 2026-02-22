import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Producto, CategoriaProducto } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = 'http://localhost:3000/productos';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizar(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCategoria(categoria: CategoriaProducto): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}?categoria=${categoria}`);
  }

  obtenerStockBajo(): Observable<Producto[]> {
    return this.obtenerTodos().pipe(
      map((productos) => productos.filter(p => p.stock < p.stockMinimo))
    );
  }

  descontarStock(id: number, cantidad: number): Observable<Producto> {
    return this.obtenerPorId(id).pipe(
      switchMap((producto) => {
        const actualizado = { ...producto, stock: producto.stock - cantidad };
        return this.actualizar(id, actualizado);
      })
    );
  }
}
