import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { TaskLinkRequest } from '../models/task-link.model';

@Injectable({ providedIn: 'root' })
export class TaskLinkService {
  constructor(private http: HttpClient) {}

  getTaskLinks(taskId: number): Observable<any> {
    return this.http.get(API_ENDPOINTS.taskLinks.byTask(taskId));
  }

  createLink(request: TaskLinkRequest): Observable<any> {
    return this.http.post(API_ENDPOINTS.taskLinks.base, request);
  }

  deleteLink(id: number): Observable<any> {
    return this.http.delete(API_ENDPOINTS.taskLinks.byId(id));
  }
}
