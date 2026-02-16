import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Attachment } from '../models/attachment.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {

  private readonly apiUrl = `${environment.apiUrl}/attachments`;

  constructor(private http: HttpClient) {}

  getTaskAttachments(taskId: number): Observable<ApiResponse<Attachment[]>> {
    return this.http.get<ApiResponse<Attachment[]>>(`${this.apiUrl}/task/${taskId}`);
  }

  uploadAttachment(taskId: number, file: File): Observable<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<Attachment>>(`${this.apiUrl}/task/${taskId}`, formData);
  }

  deleteAttachment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getDownloadUrl(id: number): string {
    return `${this.apiUrl}/${id}/download`;
  }
}
