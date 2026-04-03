import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CrudService, FiltroOptions } from './crud.service';
import { Cliente } from '../models/models';

/**
 * Servicio especializado para operaciones CRUD de clientes
 * Extiende el servicio CRUD base con funcionalidades específicas de clientes
 */
@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly entidad = 'clientes';

  constructor(private crudService: CrudService) {}

  /**
   * Obtener todos los clientes habilitados
   */
  obtenerTodos(): Observable<Cliente[]> {
    return this.crudService.obtenerTodos<Cliente>(this.entidad, { habilitado: true });
  }

  /**
   * Obtener cliente por ID
   */
  obtenerPorId(id: number): Observable<Cliente> {
    return this.crudService.obtenerPorId<Cliente>(this.entidad, id);
  }

  /**
   * Crear nuevo cliente
   */
  crear(cliente: Partial<Cliente>): Observable<Cliente> {
    const nuevoCliente = {
      ...cliente,
      // Validaciones y transformaciones específicas de cliente
      nit: cliente.nit?.toString() || '',
      telefono: cliente.telefono?.toString() || ''
    };

    return this.crudService.crear<Cliente>(this.entidad, nuevoCliente);
  }

  /**
   * Actualizar cliente existente
   */
  actualizar(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
    const clienteActualizado = {
      ...cliente,
      id: id,
      // Validaciones y transformaciones específicas
      nit: cliente.nit?.toString() || '',
      telefono: cliente.telefono?.toString() || ''
    };

    return this.crudService.actualizar<Cliente>(this.entidad, id, clienteActualizado);
  }

  /**
   * Eliminar cliente (eliminación lógica)
   */
  eliminar(id: number): Observable<any> {
    return this.crudService.eliminar(this.entidad, id);
  }

  /**
   * Restaurar cliente eliminado
   */
  restaurar(id: number): Observable<any> {
    return this.crudService.restaurar(this.entidad, id);
  }

  /**
   * Buscar clientes por término
   */
  buscar(termino: string): Observable<Cliente[]> {
    const campos = ['nombre', 'email', 'nit', 'telefono'];
    return this.crudService.buscar<Cliente>(this.entidad, termino, campos);
  }

  /**
   * Obtener clientes con filtros específicos
   */
  obtenerConFiltros(filtros: FiltroOptions): Observable<Cliente[]> {
    return this.crudService.obtenerTodos<Cliente>(this.entidad, filtros);
  }

  /**
   * Obtener todos los clientes incluyendo deshabilitados
   */
  obtenerTodosIncluirDeshabilitados(): Observable<Cliente[]> {
    return this.crudService.obtenerTodos<Cliente>(this.entidad, { incluirDeshabilitados: true });
  }

  /**
   * Validar si el NIT ya existe
   */
  validarNitExistente(nit: string, idExcluir?: number): Observable<boolean> {
    // Esta funcionalidad requeriría un endpoint específico en el backend
    // Por ahora, implementamos la lógica usando obtenerTodos
    return this.obtenerTodosIncluirDeshabilitados().pipe(
      map(clientes => {
        const nitExiste = clientes.some(cliente =>
          cliente.nit === nit && (!idExcluir || cliente.id !== idExcluir)
        );
        return nitExiste;
      })
    );
  }

  /**
   * Obtener estadísticas de clientes
   */
  obtenerEstadisticas(): Observable<{total: number, activos: number, inactivos: number}> {
    return this.obtenerTodosIncluirDeshabilitados().pipe(
      map(clientes => ({
        total: clientes.length,
        activos: clientes.filter(c => c.habilitado).length,
        inactivos: clientes.filter(c => !c.habilitado).length
      }))
    );
  }
}
