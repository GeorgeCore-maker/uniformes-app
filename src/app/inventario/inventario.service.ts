import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { Producto } from '../shared/models/models';

export interface ProductoInventario {
  id: number;
  nombre: string;
  categoria: string;
  talla: string;
  stock: number;
  stockMinimo: number;
  estado: 'NORMAL' | 'BAJO' | 'CRÍTICO';
  precio: number;
  costo: number;
  requiereConfeccion: boolean;
  habilitado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = 'http://localhost:3001/api/inventario'; // Nueva API Prisma

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos con información de inventario
   */
  obtenerInventario(): Observable<ProductoInventario[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(productos => productos.map(producto => this.mapearProductoAInventario(producto)))
    );
  }

  /**
   * Obtiene productos con stock bajo (por debajo del mínimo)
   */
  obtenerProductosStockBajo(): Observable<ProductoInventario[]> {
    return this.obtenerInventario().pipe(
      map(productos => productos.filter(p => p.estado === 'BAJO' || p.estado === 'CRÍTICO'))
    );
  }

  /**
   * Actualiza el stock de un producto
   */
  actualizarStock(id: number, nuevoStock: number): Observable<any> {
    return this.http.put<any>(`http://localhost:3001/api/productos/${id}`, {
      stock: nuevoStock
    });
  }

  /**
   * Actualiza si un producto requiere confección
   */
  actualizarRequiereConfeccion(id: number, requiereConfeccion: boolean): Observable<any> {
    return this.http.put<any>(`http://localhost:3001/api/productos/${id}`, {
      requiereConfeccion: requiereConfeccion
    });
  }

  /**
   * Mapea un producto a la estructura de inventario con estado calculado
   */
  private mapearProductoAInventario(producto: any): ProductoInventario {
    return {
      id: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      talla: producto.talla || 'N/A',
      stock: producto.stock,
      stockMinimo: producto.stockMinimo,
      estado: producto.estado,
      precio: producto.precio,
      costo: producto.costo || 0,
      requiereConfeccion: producto.requiereConfeccion,
      habilitado: producto.habilitado
    };
  }

  /**
   * Calcula el estado del stock basado en la cantidad actual vs mínima
   */
  private calcularEstadoStock(stock: number, stockMinimo: number): 'NORMAL' | 'BAJO' | 'CRÍTICO' {
    if (stock === 0) {
      return 'CRÍTICO';
    } else if (stock < stockMinimo) {
      return 'BAJO';
    } else {
      return 'NORMAL';
    }
  }
}
