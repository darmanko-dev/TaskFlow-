import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getComments(taskId: number): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(`${this.apiUrl}/tasks/${taskId}/comments`);
  }

  addComment(taskId: number, content: string): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`${this.apiUrl}/tasks/${taskId}/comments`, { content });
  }

  updateComment(taskId: number, commentId: number, content: string): Observable<ApiResponse<Comment>> {
    return this.http.put<ApiResponse<Comment>>(
      `${this.apiUrl}/tasks/${taskId}/comments/${commentId}`,
      { content }
    );
  }

  deleteComment(taskId: number, commentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/tasks/${taskId}/comments/${commentId}`
    );
  }
}
