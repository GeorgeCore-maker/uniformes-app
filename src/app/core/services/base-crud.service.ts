import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export abstract class BaseCrudService<T> {
  constructor(protected http: HttpClient, private baseUrl: string) {}

  getAll() {
    return this.http.get<T[]>(this.baseUrl);
  }

  getById(id: string) {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  create(item: T) {
    return this.http.post<T>(this.baseUrl, item);
  }

  update(id: string, item: T) {
    return this.http.put<T>(`${this.baseUrl}/${id}`, item);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
