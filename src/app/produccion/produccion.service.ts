import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, switchMap, catchError, throwError } from 'rxjs';
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
    // Obtener el item de producción para conocer el detalle asociado
    return this.obtenerPorId(id).pipe(
      switchMap(item => {
        // Solo actualizar el estado en el DetallePedido, NO en ItemProduccion
        if (item.detalleId && item.detalle?.pedido?.id) {
          return this.http.put(
            `http://localhost:3001/api/pedidos/${item.detalle.pedido.id}/detalles/${item.detalleId}`,
            { estado: nuevoEstado }
          ).pipe(
            switchMap(() => {
              // Retornar el item de producción actualizado (sin estado propio)
              return new Observable<ItemProduccion>(observer => {
                // El item mantiene sus datos originales, el estado se lee desde el detalle
                observer.next(item);
                observer.complete();
              });
            }),
            // Si falla la actualización del detalle, intentar sincronizar IDs
            catchError((error: any) => {
              console.warn('Error actualizando detalle, intentando sincronizar IDs:', error);
              return this.sincronizarDetalleItem(item, nuevoEstado).pipe(
                switchMap(() => {
                  return new Observable<ItemProduccion>(observer => {
                    observer.next(item);
                    observer.complete();
                  });
                }),
                catchError(() => {
                  // Si también falla la sincronización, retornar error
                  console.error('No se pudo sincronizar ni actualizar el estado');
                  return throwError(() => new Error('Error al cambiar estado del item'));
                })
              );
            })
          );
        } else {
          // Si no hay detalleId, no se puede cambiar estado
          console.warn('Item de producción sin detalleId asociado');
          return throwError(() => new Error('Item sin detalle asociado'));
        }
      })
    );
  }

  private sincronizarDetalleItem(item: ItemProduccion, nuevoEstado: EstadoPedido): Observable<any> {
    // Ya no necesitamos obtener el pedido por pedidoId, usamos la relación detalle
    if (!item.detalle?.pedido?.id) {
      throw new Error(`No se puede sincronizar: item sin detalle o pedido asociado`);
    }

    // Obtener el pedido completo para encontrar el detalle correcto por productoId
    return this.http.get<any>(`http://localhost:3001/api/pedidos/${item.detalle.pedido.id}`).pipe(
      switchMap(pedido => {
        // Buscar el detalle que coincida con el productoId
        const detalleCorreto = pedido.detalles.find((d: any) => d.productoId === item.productoId);

        if (!detalleCorreto) {
          throw new Error(`No se encontró detalle con productoId ${item.productoId} en pedido ${item.detalle?.pedido?.id || 'desconocido'}`);
        }

        // Actualizar el item de producción con el detalleId correcto
        const actualizarItem = this.http.put<ItemProduccion>(`${this.apiUrl}/${item.id}`, {
          ...item,
          detalleId: detalleCorreto.id,
          updatedAt: new Date().toISOString()
        });

        // Actualizar el estado del detalle correcto
        const actualizarDetalle = this.http.put(
          `http://localhost:3001/api/pedidos/${item.detalle?.pedido?.id}/detalles/${detalleCorreto.id}`,
          { estado: nuevoEstado }
        );

        return forkJoin([actualizarItem, actualizarDetalle]);
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
