import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Label, LabelRequest } from '../models/label.model';

@Injectable({ providedIn: 'root' })
export class LabelService {
  constructor(private http: HttpClient) {}

  getProjectLabels(projectId: number): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.labels.byProject(projectId)}`);
  }

  createLabel(request: LabelRequest): Observable<any> {
    return this.http.post(API_ENDPOINTS.labels.base, request);
  }

  updateLabel(id: number, request: LabelRequest): Observable<any> {
    return this.http.put(API_ENDPOINTS.labels.byId(id), request);
  }

  deleteLabel(id: number): Observable<any> {
    return this.http.delete(API_ENDPOINTS.labels.byId(id));
  }
}
