import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, switchMap } from 'rxjs';
import { ItemProduccion, EstadoPedido } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ProduccionService {
  private apiUrl = 'http://localhost:3001/api/produccion';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<ItemProduccion[]> {
    return this.http.get<ItemProduccion[]>(`${this.apiUrl}`);
  }

  obtenerPendientes(): Observable<ItemProduccion[]> {
    return this.http.get<ItemProduccion[]>(`${this.apiUrl}/pendientes`);
  }

  obtenerPorId(id: number): Observable<ItemProduccion> {
    return this.http.get<ItemProduccion>(`${this.apiUrl}/${id}`);
  }

  crear(item: ItemProduccion): Observable<ItemProduccion> {
    const nuevoItem = {
      ...item,
      habilitado: true,
      fechaInicio: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.http.post<ItemProduccion>(this.apiUrl, nuevoItem);
  }

  actualizar(id: number, item: ItemProduccion): Observable<ItemProduccion> {
    const itemActualizado = {
      ...item,
      id: id,
      habilitado: item.habilitado !== undefined ? item.habilitado : true,
      updatedAt: new Date().toISOString()
    };
    return this.http.put<ItemProduccion>(`${this.apiUrl}/${id}`, itemActualizado);
  }

  eliminar(id: number): Observable<ItemProduccion> {
    return this.http.patch<ItemProduccion>(`${this.apiUrl}/${id}`, {
      habilitado: false,
      updatedAt: new Date().toISOString()
    });
  }

  obtenerPorEstado(estado: EstadoPedido): Observable<ItemProduccion[]> {
    return this.http.get<ItemProduccion[]>(`${this.apiUrl}?estado=${estado}&habilitado=true`);
  }

  cambiarEstado(id: number, nuevoEstado: EstadoPedido): Observable<ItemProduccion> {
    // Primero obtener el item de producción para conocer el pedido y producto asociado
    return this.obtenerPorId(id).pipe(
      switchMap(item => {
        // Actualizar el estado del item de producción
        const actualizarProduccion = this.http.patch<ItemProduccion>(`${this.apiUrl}/${id}`, {
          estado: nuevoEstado,
          updatedAt: new Date().toISOString()
        });

        // Actualizar el estado en el pedido correspondiente
        const actualizarPedido = this.actualizarEstadoEnPedido(item.pedidoId, item.productoId, nuevoEstado);

        // Ejecutar ambas actualizaciones y retornar solo la del item de producción
        return forkJoin([actualizarProduccion, actualizarPedido]).pipe(
          switchMap(([itemActualizado, pedidoActualizado]) => {
            return new Observable<ItemProduccion>(observer => {
              observer.next(itemActualizado);
              observer.complete();
            });
          })
        );
      })
    );
  }

  private actualizarEstadoEnPedido(pedidoId: number, productoId: number, nuevoEstado: EstadoPedido): Observable<any> {
    // Primero obtener el pedido completo
    return this.http.get<any>(`http://localhost:3001/api/pedidos/${pedidoId}`).pipe(
      switchMap(pedido => {
        // Buscar y actualizar el detalle que coincida con el productoId
        const detallesActualizados = pedido.detalles.map((detalle: any) => {
          if (detalle.productoId === productoId) {
            return { ...detalle, estado: nuevoEstado };
          }
          return detalle;
        });

        // Actualizar el pedido con los detalles modificados
        const pedidoActualizado = {
          ...pedido,
          detalles: detallesActualizados,
          updatedAt: new Date().toISOString()
        };

        return this.http.put(`http://localhost:3001/api/pedidos/${pedidoId}`, pedidoActualizado);
      })
    );
  }

  /**
   * Crea items de producción para los detalles de un pedido que requieren confección
   */
  crearItemsDesdeDetallePedido(pedidoId: number, pedidoNumero: string, detalles: any[]): Observable<ItemProduccion[]> {
    const itemsParaProduccion = detalles
      .filter(detalle => detalle.estado === EstadoPedido.PENDIENTE || detalle.estado === EstadoPedido.EN_CONFECCION)
      .map(detalle => ({
        pedidoId: pedidoId,
        pedidoNumero: pedidoNumero,
        detalleId: detalle.id,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        estado: detalle.estado,
        observaciones: `Item generado automáticamente desde pedido ${pedidoNumero}`,
        habilitado: true
      }));

    // Crear todos los items de producción
    const observables = itemsParaProduccion.map(item => this.crear(item));

    // Retornar todos como un Observable array (esto requerirá forkJoin en el componente)
    return new Observable(observer => {
      if (itemsParaProduccion.length === 0) {
        observer.next([]);
        observer.complete();
        return;
      }

      // Para simplicidad, crear uno por uno
      Promise.all(observables.map(obs => obs.toPromise()))
        .then(resultados => {
          observer.next(resultados.filter(r => r !== undefined) as ItemProduccion[]);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }
}
