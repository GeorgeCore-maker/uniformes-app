import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CrudService } from './crud.service';
import { ItemProduccion, EstadoPedido } from '../models/models';

/**
 * Servicio especializado para operaciones CRUD de producción
 */
@Injectable({
  providedIn: 'root'
})
export class ProduccionService {
  private readonly entidad = 'produccion';

  constructor(private crudService: CrudService) {}

  /**
   * Obtener todos los items de producción
   */
  obtenerTodos(): Observable<ItemProduccion[]> {
    return this.crudService.obtenerTodos<ItemProduccion>(this.entidad);
  }

  /**
   * Obtener item de producción por ID
   */
  obtenerPorId(id: number): Observable<ItemProduccion> {
    return this.crudService.obtenerPorId<ItemProduccion>(this.entidad, id);
  }

  /**
   * Crear nuevo item de producción
   */
  crear(item: Partial<ItemProduccion>): Observable<ItemProduccion> {
    const nuevoItem = {
      ...item,
      fechaInicio: item.fechaInicio || new Date(),
      cantidad: Number(item.cantidad) || 1
    };

    return this.crudService.crear<ItemProduccion>(this.entidad, nuevoItem);
  }

  /**
   * Actualizar item de producción
   */
  actualizar(id: number, item: Partial<ItemProduccion>): Observable<ItemProduccion> {
    const itemActualizado = {
      ...item,
      id: id,
      cantidad: Number(item.cantidad) || 1
    };

    return this.crudService.actualizar<ItemProduccion>(this.entidad, id, itemActualizado);
  }

  /**
   * Eliminar item de producción
   */
  eliminar(id: number): Observable<any> {
    return this.crudService.eliminar(this.entidad, id);
  }

  /**
   * Cambiar estado de un item de producción (actualiza el detalle asociado)
   */
  cambiarEstado(item: ItemProduccion, nuevoEstado: EstadoPedido): Observable<any> {
    if (!item.detalle?.pedido?.id || !item.detalleId) {
      throw new Error('Item de producción no tiene detalle o pedido asociado');
    }

    // Actualizar el estado en el detalle del pedido
    const url = `http://localhost:3001/api/pedidos/${item.detalle.pedido.id}/detalles/${item.detalleId}`;

    return this.crudService['http'].put(url, {
      estado: nuevoEstado,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Obtener items por estado del detalle
   */
  obtenerPorEstado(estado: EstadoPedido): Observable<ItemProduccion[]> {
    return this.obtenerTodos().pipe(
      map(items => items.filter(item => item.detalle?.estado === estado))
    );
  }

  /**
   * Obtener items pendientes
   */
  obtenerPendientes(): Observable<ItemProduccion[]> {
    return this.obtenerPorEstado(EstadoPedido.PENDIENTE);
  }

  /**
   * Obtener items en confección
   */
  obtenerEnConfeccion(): Observable<ItemProduccion[]> {
    return this.obtenerPorEstado(EstadoPedido.EN_CONFECCION);
  }

  /**
   * Obtener items terminados
   */
  obtenerTerminados(): Observable<ItemProduccion[]> {
    return this.obtenerPorEstado(EstadoPedido.TERMINADO);
  }

  /**
   * Obtener items de un pedido específico
   */
  obtenerPorPedido(pedidoId: number): Observable<ItemProduccion[]> {
    return this.obtenerTodos().pipe(
      map(items => items.filter(item => item.detalle?.pedido?.id === pedidoId))
    );
  }

  /**
   * Obtener items de un producto específico
   */
  obtenerPorProducto(productoId: number): Observable<ItemProduccion[]> {
    return this.obtenerTodos().pipe(
      map(items => items.filter(item => item.productoId === productoId))
    );
  }

  /**
   * Sincronizar items de producción con detalles de pedido
   */
  sincronizarDetalleItem(item: ItemProduccion): Observable<any> {
    if (!item.detalle?.pedido?.id) {
      throw new Error('Item no tiene pedido asociado válido');
    }

    // Obtener información del pedido para sincronización
    return this.crudService.obtenerPorId('pedidos', item.detalle.pedido.id).pipe(
      switchMap((pedido: any) => {
        if (!pedido) {
          throw new Error(`No se encontró detalle con productoId ${item.productoId} en pedido ${item.detalle?.pedido?.id}`);
        }

        // Buscar el detalle correcto dentro del pedido
        const detalleCorreto = pedido.detalles?.find((d: any) => d.productoId === item.productoId);

        if (!detalleCorreto) {
          throw new Error(`No se encontró detalle con productoId ${item.productoId} en pedido ${item.detalle?.pedido?.id}`);
        }

        // Actualizar el item con el detalleId correcto
        const url = `http://localhost:3001/api/pedidos/${item.detalle?.pedido?.id}/detalles/${detalleCorreto.id}`;

        return this.crudService['http'].put(url, {
          ...item,
          detalleId: detalleCorreto.id,
          updatedAt: new Date().toISOString()
        });
      })
    );
  }

  /**
   * Obtener estadísticas de producción
   */
  obtenerEstadisticas(): Observable<{
    total: number;
    pendientes: number;
    enConfeccion: number;
    terminados: number;
    porProducto: { [key: string]: number };
  }> {
    return this.obtenerTodos().pipe(
      map(items => {
        const pendientes = items.filter(i => i.detalle?.estado === EstadoPedido.PENDIENTE).length;
        const enConfeccion = items.filter(i => i.detalle?.estado === EstadoPedido.EN_CONFECCION).length;
        const terminados = items.filter(i => i.detalle?.estado === EstadoPedido.TERMINADO).length;

        const porProducto: { [key: string]: number } = {};
        items.forEach(item => {
          const nombreProducto = item.producto?.nombre || 'Sin nombre';
          porProducto[nombreProducto] = (porProducto[nombreProducto] || 0) + item.cantidad;
        });

        return {
          total: items.length,
          pendientes,
          enConfeccion,
          terminados,
          porProducto
        };
      })
    );
  }

  /**
   * Buscar items por término
   */
  buscar(termino: string): Observable<ItemProduccion[]> {
    return this.obtenerTodos().pipe(
      map(items => items.filter(item =>
        item.observaciones?.toLowerCase().includes(termino.toLowerCase()) ||
        item.producto?.nombre?.toLowerCase().includes(termino.toLowerCase()) ||
        item.detalle?.pedido?.numero?.toLowerCase().includes(termino.toLowerCase())
      ))
    );
  }
}
