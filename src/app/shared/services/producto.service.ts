import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CrudService, FiltroOptions } from './crud.service';
import { Producto } from '../models/models';

/**
 * Servicio especializado para operaciones CRUD de productos
 */
@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly entidad = 'productos';

  constructor(private crudService: CrudService) {}

  /**
   * Obtener todos los productos habilitados
   */
  obtenerTodos(): Observable<Producto[]> {
    return this.crudService.obtenerTodos<Producto>(this.entidad, { habilitado: true });
  }

  /**
   * Obtener producto por ID
   */
  obtenerPorId(id: number): Observable<Producto> {
    return this.crudService.obtenerPorId<Producto>(this.entidad, id);
  }

  /**
   * Crear nuevo producto
   */
  crear(producto: Partial<Producto>): Observable<Producto> {
    const nuevoProducto = {
      ...producto,
      // Validaciones y transformaciones específicas
      precio: Number(producto.precio) || 0,
      costo: Number(producto.costo) || 0,
      stock: Number(producto.stock) || 0,
      stockMinimo: Number(producto.stockMinimo) || 5
    };

    return this.crudService.crear<Producto>(this.entidad, nuevoProducto);
  }

  /**
   * Actualizar producto existente
   */
  actualizar(id: number, producto: Partial<Producto>): Observable<Producto> {
    const productoActualizado = {
      ...producto,
      id: id,
      precio: Number(producto.precio) || 0,
      costo: Number(producto.costo) || 0,
      stock: Number(producto.stock) || 0,
      stockMinimo: Number(producto.stockMinimo) || 5
    };

    return this.crudService.actualizar<Producto>(this.entidad, id, productoActualizado);
  }

  /**
   * Eliminar producto (eliminación lógica)
   */
  eliminar(id: number): Observable<any> {
    return this.crudService.eliminar(this.entidad, id);
  }

  /**
   * Restaurar producto eliminado
   */
  restaurar(id: number): Observable<any> {
    return this.crudService.restaurar(this.entidad, id);
  }

  /**
   * Buscar productos por término
   */
  buscar(termino: string): Observable<Producto[]> {
    const campos = ['nombre', 'descripcion', 'categoria', 'talla'];
    return this.crudService.buscar<Producto>(this.entidad, termino, campos);
  }

  /**
   * Obtener productos por categoría
   */
  obtenerPorCategoria(categoria: string): Observable<Producto[]> {
    return this.crudService.obtenerTodos<Producto>(this.entidad, {
      categoria,
      habilitado: true
    });
  }

  /**
   * Obtener productos con stock bajo
   */
  obtenerConStockBajo(): Observable<Producto[]> {
    return this.obtenerTodos().pipe(
      map(productos => productos.filter(p => p.stock <= p.stockMinimo))
    );
  }

  /**
   * Obtener productos que requieren confección
   */
  obtenerQueRequierenConfeccion(): Observable<Producto[]> {
    return this.crudService.obtenerTodos<Producto>(this.entidad, {
      requiereConfeccion: true,
      habilitado: true
    });
  }

  /**
   * Actualizar stock de un producto
   */
  actualizarStock(id: number, nuevoStock: number): Observable<Producto> {
    return this.crudService.actualizar<Producto>(this.entidad, id, {
      stock: nuevoStock
    });
  }

  /**
   * Obtener estadísticas de productos
   */
  obtenerEstadisticas(): Observable<{
    total: number;
    activos: number;
    stockBajo: number;
    requierenConfeccion: number;
    valorTotalInventario: number;
  }> {
    return this.obtenerTodos().pipe(
      map(productos => {
        const stockBajo = productos.filter(p => p.stock <= p.stockMinimo).length;
        const requierenConfeccion = productos.filter(p => p.requiereConfeccion).length;
        const valorTotal = productos.reduce((total, p) => total + (p.precio * p.stock), 0);

        return {
          total: productos.length,
          activos: productos.filter(p => p.habilitado).length,
          stockBajo,
          requierenConfeccion,
          valorTotalInventario: valorTotal
        };
      })
    );
  }

  /**
   * Obtener productos con filtros avanzados
   */
  obtenerConFiltros(filtros: {
    categoria?: string;
    talla?: string;
    precioMin?: number;
    precioMax?: number;
    requiereConfeccion?: boolean;
    stockBajo?: boolean;
  }): Observable<Producto[]> {
    return this.obtenerTodos().pipe(
      map(productos => {
        return productos.filter(producto => {
          if (filtros.categoria && producto.categoria !== filtros.categoria) return false;
          if (filtros.talla && producto.talla !== filtros.talla) return false;
          if (filtros.precioMin && producto.precio < filtros.precioMin) return false;
          if (filtros.precioMax && producto.precio > filtros.precioMax) return false;
          if (filtros.requiereConfeccion !== undefined &&
              producto.requiereConfeccion !== filtros.requiereConfeccion) return false;
          if (filtros.stockBajo && producto.stock > producto.stockMinimo) return false;

          return true;
        });
      })
    );
  }
}
