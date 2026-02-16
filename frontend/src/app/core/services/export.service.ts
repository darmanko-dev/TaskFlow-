import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor(private http: HttpClient) {}

  exportAllTasksCSV(): void {
    this.http.get(API_ENDPOINTS.export.allTasksCsv, { responseType: 'blob' }).subscribe(blob => {
      this.downloadBlob(blob, 'tasks.csv');
    });
  }

  exportProjectTasksCSV(projectId: number): void {
    this.http.get(API_ENDPOINTS.export.projectTasksCsv(projectId), { responseType: 'blob' }).subscribe(blob => {
      this.downloadBlob(blob, 'project-tasks.csv');
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
