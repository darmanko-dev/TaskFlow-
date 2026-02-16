import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, Page } from '../models/api-response.model';
import { ActivityLog } from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private readonly apiUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  getAllActivities(page: number = 0, size: number = 20): Observable<ApiResponse<Page<ActivityLog>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<ActivityLog>>>(this.apiUrl, { params });
  }

  getProjectActivities(projectId: number, page: number = 0, size: number = 20): Observable<ApiResponse<Page<ActivityLog>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<ActivityLog>>>(`${this.apiUrl}/project/${projectId}`, { params });
  }

  getEntityActivities(entityType: string, entityId: number, page: number = 0, size: number = 20): Observable<ApiResponse<Page<ActivityLog>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<ActivityLog>>>(`${this.apiUrl}/entity/${entityType}/${entityId}`, { params });
  }
}
