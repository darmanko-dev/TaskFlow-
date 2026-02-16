import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Sprint, SprintRequest } from '../models/sprint.model';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class SprintService {

  private readonly apiUrl = `${environment.apiUrl}/sprints`;

  constructor(private http: HttpClient) {}

  getProjectSprints(projectId: number): Observable<ApiResponse<Sprint[]>> {
    return this.http.get<ApiResponse<Sprint[]>>(`${this.apiUrl}/project/${projectId}`);
  }

  getSprintById(id: number): Observable<ApiResponse<Sprint>> {
    return this.http.get<ApiResponse<Sprint>>(`${this.apiUrl}/${id}`);
  }

  getSprintTasks(sprintId: number): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/${sprintId}/tasks`);
  }

  getBacklogTasks(projectId: number): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/project/${projectId}/backlog`);
  }

  createSprint(data: SprintRequest): Observable<ApiResponse<Sprint>> {
    return this.http.post<ApiResponse<Sprint>>(this.apiUrl, data);
  }

  updateSprint(id: number, data: SprintRequest): Observable<ApiResponse<Sprint>> {
    return this.http.put<ApiResponse<Sprint>>(`${this.apiUrl}/${id}`, data);
  }

  startSprint(id: number): Observable<ApiResponse<Sprint>> {
    return this.http.patch<ApiResponse<Sprint>>(`${this.apiUrl}/${id}/start`, {});
  }

  completeSprint(id: number): Observable<ApiResponse<Sprint>> {
    return this.http.patch<ApiResponse<Sprint>>(`${this.apiUrl}/${id}/complete`, {});
  }

  addTaskToSprint(sprintId: number, taskId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${sprintId}/tasks/${taskId}`, {});
  }

  removeTaskFromSprint(sprintId: number, taskId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${sprintId}/tasks/${taskId}`);
  }

  deleteSprint(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
