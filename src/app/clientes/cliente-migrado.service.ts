import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteService as SharedClienteService } from '../shared/services/cliente.service';
import { Cliente } from '../shared/models/models';

/**
 * Servicio de clientes (migrado para usar servicios compartidos)
 * @deprecated Use SharedClienteService directly
 */
@Injectable({ providedIn: 'root' })
export class ClienteService {

  constructor(private sharedClienteService: SharedClienteService) {}

  obtenerTodos(): Observable<Cliente[]> {
    return this.sharedClienteService.obtenerTodos();
  }

  obtenerPorId(id: number): Observable<Cliente> {
    return this.sharedClienteService.obtenerPorId(id);
  }

  crear(cliente: Cliente): Observable<Cliente> {
    return this.sharedClienteService.crear(cliente);
  }

  actualizar(id: number, cliente: Cliente): Observable<Cliente> {
    return this.sharedClienteService.actualizar(id, cliente);
  }

  // Método de compatibilidad para eliminar
  eliminar(id: number): Observable<any> {
    return this.sharedClienteService.eliminar(id);
  }

  // Métodos adicionales disponibles a través del servicio compartido
  buscar(termino: string): Observable<Cliente[]> {
    return this.sharedClienteService.buscar(termino);
  }

  obtenerTodosIncluirDeshabilitados(): Observable<Cliente[]> {
    return this.sharedClienteService.obtenerTodosIncluirDeshabilitados();
  }
}
