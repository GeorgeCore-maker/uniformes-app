import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pedido } from '../../shared/models/models';

export interface RangoFechas {
  fechaInicio: Date;
  fechaFin: Date;
}

export interface EstadisticasVentas {
  totalPedidos: number;
  totalVentas: number;
  promedioVenta: number;
  ventaMinima: number;
  ventaMaxima: number;
  estadosPedidos: { [key: string]: number };
}

@Injectable({ providedIn: 'root' })
export class VentasFilterService {
  private rangoFechasSubject = new BehaviorSubject<RangoFechas>({
    fechaInicio: this.obtenerFechaInicio(),
    fechaFin: new Date()
  });

  public rangoFechas$ = this.rangoFechasSubject.asObservable();

  constructor() {}

  /**
   * Actualizar rango de fechas
   */
  actualizarRangoFechas(rangoFechas: RangoFechas): void {
    if (rangoFechas.fechaInicio <= rangoFechas.fechaFin) {
      this.rangoFechasSubject.next(rangoFechas);
    } else {
      throw new Error('La fecha de inicio no puede ser mayor que la fecha de fin');
    }
  }

  /**
   * Obtener rango de fechas actual
   */
  obtenerRangoFechasActual(): RangoFechas {
    return this.rangoFechasSubject.value;
  }

  /**
   * Filtrar pedidos por rango de fechas
   */
  filtrarPorRangoFechas(pedidos: Pedido[], rangoFechas?: RangoFechas): Pedido[] {
    const rango = rangoFechas || this.obtenerRangoFechasActual();

    return pedidos.filter((pedido: Pedido) => {
      // Intentar obtener la fecha de creación desde diferentes propiedades
      let fechaCreacion: Date;

      if (pedido.fechaCreacion) {
        fechaCreacion = new Date(pedido.fechaCreacion);
      } else if (pedido.createdAt) {
        fechaCreacion = new Date(pedido.createdAt);
      } else if (pedido.updatedAt) {
        // Como último recurso, usar updatedAt
        fechaCreacion = new Date(pedido.updatedAt);
      } else {
        // Si no hay fecha, usar la fecha actual
        fechaCreacion = new Date();
      }

      // Normalizar fechas para comparación (solo año, mes, día)
      const fechaCreacionNorm = new Date(fechaCreacion.getFullYear(), fechaCreacion.getMonth(), fechaCreacion.getDate());
      const fechaInicioNorm = new Date(rango.fechaInicio.getFullYear(), rango.fechaInicio.getMonth(), rango.fechaInicio.getDate());
      const fechaFinNorm = new Date(rango.fechaFin.getFullYear(), rango.fechaFin.getMonth(), rango.fechaFin.getDate());

      return fechaCreacionNorm >= fechaInicioNorm && fechaCreacionNorm <= fechaFinNorm;
    });
  }

  /**
   * Obtener el estado de un pedido basado en los estados de sus detalles
   */
  obtenerEstadoPedido(pedido: Pedido): string {
    if (!pedido.detalles || pedido.detalles.length === 0) {
      return 'PENDIENTE';
    }

    const estados = pedido.detalles.map(detalle => detalle.estado);

    // Si todos los detalles están entregados
    if (estados.every(estado => estado === 'ENTREGADO')) {
      return 'ENTREGADO';
    }

    // Si todos los detalles están terminados o entregados
    if (estados.every(estado => estado === 'TERMINADO' || estado === 'ENTREGADO')) {
      return 'TERMINADO';
    }

    // Si hay al menos un detalle en confección
    if (estados.some(estado => estado === 'EN_CONFECCION')) {
      return 'EN_CONFECCION';
    }

    // Si hay al menos un detalle enviado
    if (estados.some(estado => estado === 'ENVIADO')) {
      return 'ENVIADO';
    }

    // Si todos están cancelados
    if (estados.every(estado => estado === 'CANCELADO')) {
      return 'CANCELADO';
    }

    // Por defecto, pendiente
    return 'PENDIENTE';
  }

  /**
   * Filtrar pedidos por rango de fechas y estado
   */
  filtrarPorRangoFechasYEstado(
    pedidos: Pedido[],
    estado: string,
    rangoFechas?: RangoFechas
  ): Pedido[] {
    const filtrados = this.filtrarPorRangoFechas(pedidos, rangoFechas);
    return filtrados.filter((pedido: Pedido) => this.obtenerEstadoPedido(pedido) === estado);
  }

  /**
   * Obtener estadísticas de ventas para un rango de fechas
   */
  obtenerEstadisticasVentas(pedidos: Pedido[], rangoFechas?: RangoFechas): EstadisticasVentas {
    const filtrados = this.filtrarPorRangoFechas(pedidos, rangoFechas);

    if (filtrados.length === 0) {
      return {
        totalPedidos: 0,
        totalVentas: 0,
        promedioVenta: 0,
        ventaMinima: 0,
        ventaMaxima: 0,
        estadosPedidos: {}
      };
    }

    const totalVentas = filtrados.reduce((sum, pedido) => sum + pedido.total, 0);
    const ventaMinima = Math.min(...filtrados.map(p => p.total));
    const ventaMaxima = Math.max(...filtrados.map(p => p.total));
    const promedioVenta = totalVentas / filtrados.length;

    const estadosPedidos: { [key: string]: number } = {};
    filtrados.forEach((pedido: Pedido) => {
      const estado = this.obtenerEstadoPedido(pedido);
      estadosPedidos[estado] = (estadosPedidos[estado] || 0) + 1;
    });

    return {
      totalPedidos: filtrados.length,
      totalVentas,
      promedioVenta,
      ventaMinima,
      ventaMaxima,
      estadosPedidos
    };
  }

  /**
   * Obtener ventas agrupadas por día
   */
  ventasPorDia(pedidos: Pedido[], rangoFechas?: RangoFechas): { [key: string]: number } {
    const filtrados = this.filtrarPorRangoFechas(pedidos, rangoFechas);
    const ventasPorDia: { [key: string]: number } = {};

    filtrados.forEach((pedido: Pedido) => {
      const fecha = new Date(pedido.fechaCreacion);
      const fechaStr = fecha.toISOString().split('T')[0];
      ventasPorDia[fechaStr] = (ventasPorDia[fechaStr] || 0) + pedido.total;
    });

    return ventasPorDia;
  }

  /**
   * Obtener ventas agrupadas por cliente
   */
  ventasPorCliente(
    pedidos: Pedido[],
    rangoFechas?: RangoFechas
  ): { clienteId: number; totalVentas: number; cantidad: number }[] {
    const filtrados = this.filtrarPorRangoFechas(pedidos, rangoFechas);
    const ventasMap: { [key: number]: { totalVentas: number; cantidad: number } } = {};

    filtrados.forEach((pedido: Pedido) => {
      const clienteId = pedido.clienteId;
      if (!ventasMap[clienteId]) {
        ventasMap[clienteId] = { totalVentas: 0, cantidad: 0 };
      }
      ventasMap[clienteId].totalVentas += pedido.total;
      ventasMap[clienteId].cantidad += 1;
    });

    return Object.entries(ventasMap).map(([clienteId, datos]) => ({
      clienteId: parseInt(clienteId),
      ...datos
    }));
  }

  /**
   * Establecer últimos 7 días
   */
  establecerUltimos7Dias(): void {
    const hoy = new Date();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hoy.getDate() - 7);

    this.actualizarRangoFechas({
      fechaInicio: hace7Dias,
      fechaFin: hoy
    });
  }

  /**
   * Establecer últimos 30 días
   */
  establecerUltimos30Dias(): void {
    const hoy = new Date();
    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hoy.getDate() - 30);

    this.actualizarRangoFechas({
      fechaInicio: hace30Dias,
      fechaFin: hoy
    });
  }

  /**
   * Establecer mes actual
   */
  establecerMesActual(): void {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    this.actualizarRangoFechas({
      fechaInicio: primerDia,
      fechaFin: hoy
    });
  }

  /**
   * Establecer año actual
   */
  establecerAñoActual(): void {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), 0, 1);

    this.actualizarRangoFechas({
      fechaInicio: primerDia,
      fechaFin: hoy
    });
  }

  /**
   * Obtener fecha de inicio por defecto (hace 30 días)
   */
  private obtenerFechaInicio(): Date {
    const hoy = new Date();
    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hoy.getDate() - 30);
    return hace30Dias;
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatear moneda
   */
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }
}
