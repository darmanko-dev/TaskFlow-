import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, Page } from '../models/api-response.model';
import { Task, TaskRequest, TaskStatus, BulkTaskUpdateRequest } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(page: number = 0, size: number = 10): Observable<ApiResponse<Page<Task>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Page<Task>>>(this.apiUrl, { params });
  }

  getTaskById(id: number): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`);
  }

  getTasksByProject(projectId: number): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/project/${projectId}`);
  }

  getMyTasks(page: number = 0, size: number = 10): Observable<ApiResponse<Page<Task>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Page<Task>>>(`${this.apiUrl}/my-tasks`, { params });
  }

  getWatchedTasks(page: number = 0, size: number = 10): Observable<ApiResponse<Page<Task>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Page<Task>>>(`${this.apiUrl}/watched`, { params });
  }

  createTask(data: TaskRequest): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(this.apiUrl, data);
  }

  updateTask(id: number, data: TaskRequest): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}`, data);
  }

  updateTaskStatus(id: number, status: TaskStatus): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteTask(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  searchTasks(query: string, page: number = 0, size: number = 10): Observable<ApiResponse<Page<Task>>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Page<Task>>>(`${this.apiUrl}/search`, { params });
  }

  watchTask(taskId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${taskId}/watchers`, {});
  }

  unwatchTask(taskId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${taskId}/watchers`);
  }

  bulkUpdateTasks(request: BulkTaskUpdateRequest): Observable<ApiResponse<Task[]>> {
    return this.http.patch<ApiResponse<Task[]>>(`${this.apiUrl}/bulk`, request);
  }
}
