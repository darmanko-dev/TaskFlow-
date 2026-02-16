import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { SavedFilterRequest } from '../models/saved-filter.model';

@Injectable({ providedIn: 'root' })
export class SavedFilterService {
  constructor(private http: HttpClient) {}

  getUserFilters(): Observable<any> {
    return this.http.get(API_ENDPOINTS.filters.base);
  }

  getProjectFilters(projectId: number): Observable<any> {
    return this.http.get(API_ENDPOINTS.filters.byProject(projectId));
  }

  createFilter(request: SavedFilterRequest): Observable<any> {
    return this.http.post(API_ENDPOINTS.filters.base, request);
  }

  updateFilter(id: number, request: SavedFilterRequest): Observable<any> {
    return this.http.put(API_ENDPOINTS.filters.byId(id), request);
  }

  deleteFilter(id: number): Observable<any> {
    return this.http.delete(API_ENDPOINTS.filters.byId(id));
  }
}
