// Servicio de base de datos para SQLite (Fase 1)
// src/app/core/services/database.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql' | 'mysql';
  host?: string;
  port?: number;
  database: string;
  ssl?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly API_URL = 'http://localhost:3001/api'; // Backend Express con Prisma
  private configSubject = new BehaviorSubject<DatabaseConfig>({ type: 'sqlite', database: 'uniformes.db' });

  public config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // Configuración inicial para SQLite local
    const config: DatabaseConfig = {
      type: 'sqlite',
      database: 'uniformes.db'
    };
    this.configSubject.next(config);
  }

  // === MÉTODOS GENÉRICOS ===

  /**
   * Ejecuta una consulta genérica
   */
  query<T>(sql: string, params: any[] = []): Observable<T[]> {
    return this.http.post<T[]>(`${this.API_URL}/query`, { sql, params })
      .pipe(
        catchError(this.handleError<T[]>('query', []))
      );
  }

  /**
   * Obtiene registros de una tabla con filtros opcionales
   */
  find<T>(table: string, where?: any, options?: { orderBy?: any, limit?: number, offset?: number }): Observable<T[]> {
    const queryParams = new URLSearchParams();

    if (where) queryParams.append('where', JSON.stringify(where));
    if (options?.orderBy) queryParams.append('orderBy', JSON.stringify(options.orderBy));
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());

    return this.http.get<T[]>(`${this.API_URL}/${table}?${queryParams}`)
      .pipe(
        catchError(this.handleError<T[]>('find', []))
      );
  }

  /**
   * Obtiene un registro por ID
   */
  findById<T>(table: string, id: number): Observable<T | null> {
    return this.http.get<T>(`${this.API_URL}/${table}/${id}`)
      .pipe(
        catchError(this.handleError<T>('findById'))
      );
  }

  /**
   * Crea un nuevo registro
   */
  create<T>(table: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Observable<T> {
    return this.http.post<T>(`${this.API_URL}/${table}`, data)
      .pipe(
        catchError(this.handleError<T>('create'))
      );
  }

  /**
   * Actualiza un registro existente
   */
  update<T>(table: string, id: number, data: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.API_URL}/${table}/${id}`, data)
      .pipe(
        catchError(this.handleError<T>('update'))
      );
  }

  /**
   * Elimina un registro
   */
  delete(table: string, id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.API_URL}/${table}/${id}`)
      .pipe(
        catchError(this.handleError<boolean>('delete', false))
      );
  }

  // === MÉTODOS ESPECÍFICOS PARA EL NEGOCIO ===

  /**
   * Obtiene el estado del inventario
   */
  getInventarioStatus(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/inventario/status`)
      .pipe(
        catchError(this.handleError<any>('getInventarioStatus', {}))
      );
  }

  /**
   * Actualiza stock de productos
   */
  updateStock(productoId: number, cantidad: number, tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/inventario/movimiento`, {
      productoId,
      cantidad,
      tipo,
      motivo: `Ajuste de stock - ${tipo}`
    }).pipe(
      catchError(this.handleError<any>('updateStock'))
    );
  }

  /**
   * Sincroniza pedidos con producción
   */
  syncProduccion(): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/produccion/sync`, {})
      .pipe(
        catchError(this.handleError<any>('syncProduccion'))
      );
  }

  // === MIGRACIÓN Y CONFIGURACIÓN ===

  /**
   * Migra desde el formato JSON actual
   */
  migrateFromJson(jsonData: any): Observable<boolean> {
    return this.http.post<boolean>(`${this.API_URL}/migration/from-json`, jsonData)
      .pipe(
        tap(() => console.log('✅ Migración desde JSON completada')),
        catchError(this.handleError<boolean>('migrateFromJson', false))
      );
  }

  /**
   * Cambia la configuración de base de datos (para migración a PostgreSQL/MySQL)
   */
  changeDatabase(config: DatabaseConfig): Observable<boolean> {
    return this.http.post<boolean>(`${this.API_URL}/config/database`, config)
      .pipe(
        tap(() => {
          this.configSubject.next(config);
          console.log(`✅ Base de datos cambiada a ${config.type}`);
        }),
        catchError(this.handleError<boolean>('changeDatabase', false))
      );
  }

  /**
   * Exporta la base de datos actual
   */
  exportDatabase(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/backup/export`, { responseType: 'blob' })
      .pipe(
        catchError(this.handleError<Blob>('exportDatabase'))
      );
  }

  /**
   * Importa una base de datos desde archivo
   */
  importDatabase(file: File): Observable<boolean> {
    const formData = new FormData();
    formData.append('backup', file);

    return this.http.post<boolean>(`${this.API_URL}/backup/import`, formData)
      .pipe(
        catchError(this.handleError<boolean>('importDatabase', false))
      );
  }

  /**
   * Verifica la conectividad con la base de datos
   */
  checkConnection(): Observable<{ connected: boolean, type: string, version?: string }> {
    return this.http.get<{ connected: boolean, type: string, version?: string }>(`${this.API_URL}/health`)
      .pipe(
        catchError(this.handleError<{ connected: boolean, type: string }>('checkConnection',
          { connected: false, type: 'unknown' }))
      );
  }

  // === MANEJO DE ERRORES ===

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);

      // Log error to remote logging infrastructure if needed
      // this.log(`${operation} failed: ${error.message}`);

      // Return empty result to keep the app running
      return new Observable(observer => {
        observer.next(result as T);
        observer.complete();
      });
    };
  }
}
