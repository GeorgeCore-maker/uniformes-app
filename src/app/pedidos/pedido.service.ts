import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Pedido, EstadoPedido } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private apiUrl = 'http://localhost:3001/api/pedidos';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}?habilitado=true`);
  }

  obtenerPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  crear(pedido: Pedido): Observable<Pedido> {
    const nuevoPedido = {
      ...pedido,
      habilitado: true,
      fechaCreacion: new Date().toISOString(),  // Asegurar consistencia con fechaCreacion
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Convertir precioUnitario a string en los detalles para compatibilidad con base de datos
      detalles: pedido.detalles?.map(detalle => ({
        ...detalle,
        precioUnitario: detalle.precioUnitario?.toString() || '0'
      })) || []
    };
    return this.http.post<Pedido>(this.apiUrl, nuevoPedido);
  }

  actualizar(id: number, pedido: Pedido): Observable<Pedido> {
    const pedidoActualizado = {
      ...pedido,
      // Asegurar propiedades críticas mínimas
      id: id,
      habilitado: pedido.habilitado !== undefined ? pedido.habilitado : true,
      fechaCreacion: pedido.fechaCreacion || pedido.createdAt || new Date(),
      createdAt: pedido.createdAt || pedido.fechaCreacion || new Date(),
      updatedAt: new Date().toISOString(),
      // Convertir precioUnitario a string en los detalles para compatibilidad con base de datos
      detalles: pedido.detalles?.map(detalle => ({
        ...detalle,
        precioUnitario: detalle.precioUnitario?.toString() || '0'
      })) || []
    };
    return this.http.put<Pedido>(`${this.apiUrl}/${id}`, pedidoActualizado);
  }

  eliminar(id: number): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}`, {
      habilitado: false,
      fechaDeshabilitado: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  obtenerPorEstado(estado: EstadoPedido): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}?estado=${estado}&habilitado=true`);
  }

  /**
   * Generar el siguiente número consecutivo de pedido
   */
  generarSiguienteNumero(): Observable<string> {
    return this.http.get<Pedido[]>(`${this.apiUrl}?incluirDeshabilitados=true`).pipe(
      map(pedidos => {
        if (pedidos.length === 0) {
          return 'PED-001';
        }

        // Extraer números de los pedidos existentes (incluyendo deshabilitados)
        const numeros = pedidos
          .map(p => p.numero)
          .filter(numero => numero && numero.startsWith('PED-'))
          .map(numero => {
            const parts = numero.split('-');
            return parts.length === 2 ? parseInt(parts[1], 10) : 0;
          })
          .filter(num => !isNaN(num));

        const ultimoNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
        const siguienteNumero = ultimoNumero + 1;

        return `PED-${siguienteNumero.toString().padStart(3, '0')}`;
      })
    );
  }

  cambiarEstado(id: number, nuevoEstado: EstadoPedido): Observable<Pedido> {
    return this.obtenerPorId(id).pipe(
      switchMap((pedido) => {
        const actualizado = {
          ...pedido,
          estado: nuevoEstado,
          // Preservar fechas de creación si existen
          fechaCreacion: pedido.fechaCreacion || pedido.createdAt || new Date(),
          createdAt: pedido.createdAt || pedido.fechaCreacion || new Date()
        };
        return this.actualizar(id, actualizado);
      })
    );
  }
}
