import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Producto, CategoriaProducto } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = 'http://localhost:3001/api/productos';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}?habilitado=true`);
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crear(producto: Producto): Observable<Producto> {
    const nuevoProducto = {
      ...producto,
      habilitado: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.http.post<Producto>(this.apiUrl, nuevoProducto);
  }

  actualizar(id: number, producto: Producto): Observable<Producto> {
    const productoActualizado = {
      ...producto,
      updatedAt: new Date().toISOString()
    };
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, productoActualizado);
  }

  eliminar(id: number): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/${id}`, {
      habilitado: false,
      fechaDeshabilitado: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  obtenerPorCategoria(categoria: CategoriaProducto): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}?categoria=${categoria}&habilitado=true`);
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
