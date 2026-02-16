import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  getSprintReport(sprintId: number): Observable<any> {
    return this.http.get(API_ENDPOINTS.reports.sprint(sprintId));
  }

  getTeamVelocity(projectId: number, sprints: number = 5): Observable<any> {
    return this.http.get(API_ENDPOINTS.reports.velocity(projectId), { params: { sprints } });
  }
}
