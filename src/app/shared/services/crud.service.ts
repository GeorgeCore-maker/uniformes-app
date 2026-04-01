import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Interfaz para opciones de filtrado
 */
export interface FiltroOptions {
  habilitado?: boolean;
  incluirDeshabilitados?: boolean;
  estado?: string;
  [key: string]: any;
}

/**
 * Interfaz para respuesta paginada
 */
export interface RespuestaPaginada<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
}

/**
 * Servicio CRUD genérico unificado
 * Maneja todas las operaciones CRUD para cualquier entidad de la aplicación
 */
@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private readonly baseUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los registros de una entidad
   * @param entidad - Nombre de la entidad (clientes, productos, pedidos, etc.)
   * @param filtros - Filtros opcionales
   */
  obtenerTodos<T>(entidad: string, filtros?: FiltroOptions): Observable<T[]> {
    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null) {
          params = params.set(key, filtros[key].toString());
        }
      });
    }

    const url = `${this.baseUrl}/${entidad}`;
    return this.http.get<T[]>(url, { params }).pipe(
      catchError(this.manejarError<T[]>('obtenerTodos', []))
    );
  }

  /**
   * Obtener un registro por ID
   * @param entidad - Nombre de la entidad
   * @param id - ID del registro
   */
  obtenerPorId<T>(entidad: string, id: number): Observable<T> {
    const url = `${this.baseUrl}/${entidad}/${id}`;
    return this.http.get<T>(url).pipe(
      catchError(this.manejarError<T>('obtenerPorId'))
    );
  }

  /**
   * Crear un nuevo registro
   * @param entidad - Nombre de la entidad
   * @param datos - Datos del nuevo registro
   */
  crear<T>(entidad: string, datos: Partial<T>): Observable<T> {
    const url = `${this.baseUrl}/${entidad}`;
    const datosConMetadata = this.agregarMetadataCreacion(datos);

    return this.http.post<T>(url, datosConMetadata).pipe(
      catchError(this.manejarError<T>('crear'))
    );
  }

  /**
   * Actualizar un registro existente
   * @param entidad - Nombre de la entidad
   * @param id - ID del registro
   * @param datos - Datos actualizados
   */
  actualizar<T>(entidad: string, id: number, datos: Partial<T>): Observable<T> {
    const url = `${this.baseUrl}/${entidad}/${id}`;
    const datosConMetadata = this.agregarMetadataActualizacion(datos);

    return this.http.put<T>(url, datosConMetadata).pipe(
      catchError(this.manejarError<T>('actualizar'))
    );
  }

  /**
   * Eliminar un registro (eliminación lógica)
   * @param entidad - Nombre de la entidad
   * @param id - ID del registro
   */
  eliminar(entidad: string, id: number): Observable<any> {
    const url = `${this.baseUrl}/${entidad}/${id}`;
    const datosDeshabilitacion = {
      habilitado: false,
      fechaDeshabilitado: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.http.put(url, datosDeshabilitacion).pipe(
      catchError(this.manejarError('eliminar'))
    );
  }

  /**
   * Eliminar definitivamente un registro
   * @param entidad - Nombre de la entidad
   * @param id - ID del registro
   */
  eliminarDefinitivo(entidad: string, id: number): Observable<any> {
    const url = `${this.baseUrl}/${entidad}/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.manejarError('eliminarDefinitivo'))
    );
  }

  /**
   * Restaurar un registro eliminado
   * @param entidad - Nombre de la entidad
   * @param id - ID del registro
   */
  restaurar(entidad: string, id: number): Observable<any> {
    const url = `${this.baseUrl}/${entidad}/${id}`;
    const datosRestauracion = {
      habilitado: true,
      fechaDeshabilitado: null,
      updatedAt: new Date().toISOString()
    };

    return this.http.put(url, datosRestauracion).pipe(
      catchError(this.manejarError('restaurar'))
    );
  }

  /**
   * Obtener registros con paginación
   * @param entidad - Nombre de la entidad
   * @param pagina - Número de página
   * @param limite - Cantidad de registros por página
   * @param filtros - Filtros opcionales
   */
  obtenerPaginado<T>(
    entidad: string,
    pagina: number = 1,
    limite: number = 10,
    filtros?: FiltroOptions
  ): Observable<RespuestaPaginada<T>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null) {
          params = params.set(key, filtros[key].toString());
        }
      });
    }

    const url = `${this.baseUrl}/${entidad}/paginado`;
    return this.http.get<RespuestaPaginada<T>>(url, { params }).pipe(
      catchError(this.manejarError<RespuestaPaginada<T>>('obtenerPaginado'))
    );
  }

  /**
   * Buscar registros por términos de búsqueda
   * @param entidad - Nombre de la entidad
   * @param termino - Término de búsqueda
   * @param campos - Campos donde buscar
   */
  buscar<T>(entidad: string, termino: string, campos: string[] = []): Observable<T[]> {
    let params = new HttpParams().set('buscar', termino);

    if (campos.length > 0) {
      params = params.set('campos', campos.join(','));
    }

    const url = `${this.baseUrl}/${entidad}/buscar`;
    return this.http.get<T[]>(url, { params }).pipe(
      catchError(this.manejarError<T[]>('buscar', []))
    );
  }

  /**
   * Obtener conteo de registros
   * @param entidad - Nombre de la entidad
   * @param filtros - Filtros opcionales
   */
  obtenerConteo(entidad: string, filtros?: FiltroOptions): Observable<number> {
    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null) {
          params = params.set(key, filtros[key].toString());
        }
      });
    }

    const url = `${this.baseUrl}/${entidad}/conteo`;
    return this.http.get<{conteo: number}>(url, { params }).pipe(
      map(response => response.conteo),
      catchError(this.manejarError<number>('obtenerConteo', 0))
    );
  }

  // Métodos auxiliares privados

  /**
   * Agregar metadata de creación
   */
  private agregarMetadataCreacion<T>(datos: Partial<T>): Partial<T> {
    return {
      ...datos,
      habilitado: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Agregar metadata de actualización
   */
  private agregarMetadataActualizacion<T>(datos: Partial<T>): Partial<T> {
    return {
      ...datos,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Manejo de errores unificado
   */
  private manejarError<T>(operacion = 'operación', resultado?: T) {
    return (error: any): Observable<T> => {
      console.error(`Error en ${operacion}:`, error);

      // Aquí puedes agregar logging o notificaciones
      // Por ejemplo, integrar con un servicio de notificaciones

      // Devolver un resultado seguro para que la aplicación siga funcionando
      return new Observable<T>(observer => {
        if (resultado !== undefined) {
          observer.next(resultado);
        }
        observer.error(error);
        observer.complete();
      });
    };
  }
}
