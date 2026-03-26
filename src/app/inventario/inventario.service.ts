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
      stockActual: nuevoStock,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Actualiza si un producto requiere confección
   */
  actualizarRequiereConfeccion(id: number, requiereConfeccion: boolean): Observable<any> {
    return this.http.put<any>(`http://localhost:3001/api/productos/${id}`, {
      requiereConfeccion: requiereConfeccion,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Mapea un producto a la estructura de inventario con estado calculado
   */
  private mapearProductoAInventario(producto: any): ProductoInventario {
    // La nueva API ya calcula el estado automáticamente
    const estado = producto.estado || this.calcularEstadoStock(producto.stockActual, producto.stockMinimo);

    return {
      id: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      talla: producto.talla || 'N/A', // Campo no existe en nueva DB, usar N/A
      stock: producto.stockActual, // Campo actualizado en nueva DB
      stockMinimo: producto.stockMinimo,
      estado: estado,
      precio: producto.precio,
      costo: producto.costo || 0, // Campo no existe en nueva DB, usar 0
      requiereConfeccion: producto.requiereConfeccion,
      habilitado: producto.activo // Campo actualizado en nueva DB
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
