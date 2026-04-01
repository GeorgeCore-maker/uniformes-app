import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private pedidoActualizadoSubject = new Subject<{ pedidoId: number, detalleId?: number, nuevoEstado?: string }>();
  private produccionActualizadaSubject = new Subject<{ itemId: number, detalleId: number, nuevoEstado: string }>();

  // Observable para cuando se actualiza un pedido
  pedidoActualizado$ = this.pedidoActualizadoSubject.asObservable();

  // Observable para cuando se actualiza un item de producción
  produccionActualizada$ = this.produccionActualizadaSubject.asObservable();

  // Emitir evento cuando se actualiza un pedido
  emitirPedidoActualizado(pedidoId: number, detalleId?: number, nuevoEstado?: string) {
    this.pedidoActualizadoSubject.next({ pedidoId, detalleId, nuevoEstado });
  }

  // Emitir evento cuando se actualiza un item de producción
  emitirProduccionActualizada(itemId: number, detalleId: number, nuevoEstado: string) {
    this.produccionActualizadaSubject.next({ itemId, detalleId, nuevoEstado });
  }
}
