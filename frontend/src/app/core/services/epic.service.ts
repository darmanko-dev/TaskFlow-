import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Epic, EpicRequest } from '../models/epic.model';

@Injectable({
  providedIn: 'root'
})
export class EpicService {

  private readonly apiUrl = `${environment.apiUrl}/epics`;

  constructor(private http: HttpClient) {}

  getProjectEpics(projectId: number): Observable<ApiResponse<Epic[]>> {
    return this.http.get<ApiResponse<Epic[]>>(`${this.apiUrl}/project/${projectId}`);
  }

  getEpicById(id: number): Observable<ApiResponse<Epic>> {
    return this.http.get<ApiResponse<Epic>>(`${this.apiUrl}/${id}`);
  }

  createEpic(data: EpicRequest): Observable<ApiResponse<Epic>> {
    return this.http.post<ApiResponse<Epic>>(this.apiUrl, data);
  }

  updateEpic(id: number, data: EpicRequest): Observable<ApiResponse<Epic>> {
    return this.http.put<ApiResponse<Epic>>(`${this.apiUrl}/${id}`, data);
  }

  deleteEpic(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
