import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CrudService, FiltroOptions } from './crud.service';
import { Pedido, EstadoPedido } from '../models/models';

/**
 * Servicio especializado para operaciones CRUD de pedidos
 */
@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly entidad = 'pedidos';

  constructor(private crudService: CrudService) {}

  /**
   * Obtener todos los pedidos habilitados
   */
  obtenerTodos(): Observable<Pedido[]> {
    return this.crudService.obtenerTodos<Pedido>(this.entidad, { habilitado: true });
  }

  /**
   * Obtener pedido por ID
   */
  obtenerPorId(id: number): Observable<Pedido> {
    return this.crudService.obtenerPorId<Pedido>(this.entidad, id);
  }

  /**
   * Crear nuevo pedido
   */
  crear(pedido: Pedido): Observable<Pedido> {
    const nuevoPedido = {
      ...pedido,
      fechaCreacion: new Date().toISOString(),
      // Mantener compatibilidad con la base de datos
      detalles: pedido.detalles?.map(detalle => ({
        ...detalle,
        precioUnitario: Number(detalle.precioUnitario) || 0
      })) || []
    } as any; // Usar 'any' para evitar conflictos de tipado durante la transición

    return this.crudService.crear<Pedido>(this.entidad, nuevoPedido);
  }

  /**
   * Actualizar pedido existente
   */
  actualizar(id: number, pedido: Pedido): Observable<Pedido> {
    const pedidoActualizado = {
      ...pedido,
      id: id,
      fechaCreacion: pedido.fechaCreacion || pedido.createdAt || new Date(),
      // Mantener compatibilidad con la base de datos
      detalles: pedido.detalles?.map(detalle => ({
        ...detalle,
        precioUnitario: Number(detalle.precioUnitario) || 0
      })) || []
    } as any; // Usar 'any' para evitar conflictos de tipado

    return this.crudService.actualizar<Pedido>(this.entidad, id, pedidoActualizado);
  }

  /**
   * Eliminar pedido (eliminación lógica)
   */
  eliminar(id: number): Observable<any> {
    return this.crudService.eliminar(this.entidad, id);
  }

  /**
   * Restaurar pedido eliminado
   */
  restaurar(id: number): Observable<any> {
    return this.crudService.restaurar(this.entidad, id);
  }

  /**
   * Obtener pedidos por estado
   */
  obtenerPorEstado(estado: EstadoPedido): Observable<Pedido[]> {
    return this.crudService.obtenerTodos<Pedido>(this.entidad, {
      estado,
      habilitado: true
    });
  }

  /**
   * Obtener todos los pedidos incluyendo deshabilitados
   */
  obtenerTodosIncluirDeshabilitados(): Observable<Pedido[]> {
    return this.crudService.obtenerTodos<Pedido>(this.entidad, { incluirDeshabilitados: true });
  }

  /**
   * Buscar pedidos por término
   */
  buscar(termino: string): Observable<Pedido[]> {
    const campos = ['numero', 'observaciones'];
    return this.crudService.buscar<Pedido>(this.entidad, termino, campos);
  }

  /**
   * Obtener pedidos de un cliente específico
   */
  obtenerPorCliente(clienteId: number): Observable<Pedido[]> {
    return this.crudService.obtenerTodos<Pedido>(this.entidad, {
      clienteId,
      habilitado: true
    });
  }

  /**
   * Obtener pedidos pendientes
   */
  obtenerPendientes(): Observable<Pedido[]> {
    return this.obtenerTodos().pipe(
      map(pedidos => pedidos.filter(pedido => {
        // Verificar si algún detalle está pendiente o en confección
        if (pedido.detalles && pedido.detalles.length > 0) {
          return pedido.detalles.some(detalle =>
            detalle.estado === EstadoPedido.PENDIENTE ||
            detalle.estado === EstadoPedido.EN_CONFECCION
          );
        }
        return false;
      }))
    );
  }

  /**
   * Obtener pedidos completados
   */
  obtenerCompletados(): Observable<Pedido[]> {
    return this.obtenerTodos().pipe(
      map(pedidos => pedidos.filter(pedido => {
        // Verificar si todos los detalles están terminados
        if (pedido.detalles && pedido.detalles.length > 0) {
          return pedido.detalles.every(detalle =>
            detalle.estado === EstadoPedido.TERMINADO
          );
        }
        return false;
      }))
    );
  }

  /**
   * Calcular estadísticas de pedidos
   */
  obtenerEstadisticas(): Observable<{
    total: number;
    pendientes: number;
    enConfeccion: number;
    terminados: number;
    valorTotal: number;
    valorPendiente: number;
  }> {
    return this.obtenerTodos().pipe(
      map(pedidos => {
        const pendientes = pedidos.filter(p =>
          p.detalles?.some(d => d.estado === EstadoPedido.PENDIENTE)
        ).length;

        const enConfeccion = pedidos.filter(p =>
          p.detalles?.some(d => d.estado === EstadoPedido.EN_CONFECCION)
        ).length;

        const terminados = pedidos.filter(p =>
          p.detalles?.every(d => d.estado === EstadoPedido.TERMINADO)
        ).length;

        const valorTotal = pedidos.reduce((total, p) => total + p.total, 0);

        const valorPendiente = pedidos
          .filter(p => p.detalles?.some(d =>
            d.estado === EstadoPedido.PENDIENTE ||
            d.estado === EstadoPedido.EN_CONFECCION
          ))
          .reduce((total, p) => total + p.total, 0);

        return {
          total: pedidos.length,
          pendientes,
          enConfeccion,
          terminados,
          valorTotal,
          valorPendiente
        };
      })
    );
  }

  /**
   * Obtener pedidos con filtros avanzados
   */
  obtenerConFiltros(filtros: {
    clienteId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    montoMin?: number;
    montoMax?: number;
    incluirIva?: boolean;
  }): Observable<Pedido[]> {
    return this.obtenerTodos().pipe(
      map(pedidos => {
        return pedidos.filter(pedido => {
          if (filtros.clienteId && pedido.clienteId !== filtros.clienteId) return false;

          if (filtros.fechaDesde) {
            const fechaPedido = new Date(pedido.fechaCreacion || '');
            const fechaDesde = new Date(filtros.fechaDesde);
            if (fechaPedido < fechaDesde) return false;
          }

          if (filtros.fechaHasta) {
            const fechaPedido = new Date(pedido.fechaCreacion || '');
            const fechaHasta = new Date(filtros.fechaHasta);
            if (fechaPedido > fechaHasta) return false;
          }

          if (filtros.montoMin && pedido.total < filtros.montoMin) return false;
          if (filtros.montoMax && pedido.total > filtros.montoMax) return false;
          if (filtros.incluirIva !== undefined && pedido.incluirIva !== filtros.incluirIva) return false;

          return true;
        });
      })
    );
  }
}
