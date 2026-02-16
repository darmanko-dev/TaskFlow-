import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { ApiResponse, Page } from '../models/api-response.model';
import { AppNotification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketNotificationService implements OnDestroy {

  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private newNotificationSubject = new Subject<AppNotification>();
  public newNotification$ = this.newNotificationSubject.asObservable();

  private pollingInterval: any;

  constructor(private http: HttpClient) {}

  connect(): void {
    this.loadNotifications();
    this.loadUnreadCount();

    // Poll every 30 seconds for new notifications
    this.pollingInterval = setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  disconnect(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadNotifications(page: number = 0, size: number = 20): void {
    this.http.get<ApiResponse<Page<AppNotification>>>(`${this.apiUrl}?page=${page}&size=${size}`)
      .subscribe(res => {
        if (res.success) {
          this.notificationsSubject.next(res.data.content);
        }
      });
  }

  loadUnreadCount(): void {
    this.http.get<ApiResponse<{count: number}>>(`${this.apiUrl}/unread-count`)
      .subscribe(res => {
        if (res.success) {
          this.unreadCountSubject.next(res.data.count);
        }
      });
  }

  markAsRead(id: number): Observable<ApiResponse<void>> {
    const result = this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/read`, {});
    result.subscribe(() => {
      this.loadUnreadCount();
      const notifications = this.notificationsSubject.value.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      this.notificationsSubject.next(notifications);
    });
    return result;
  }

  markAllAsRead(): Observable<ApiResponse<void>> {
    const result = this.http.patch<ApiResponse<void>>(`${this.apiUrl}/read-all`, {});
    result.subscribe(() => {
      this.unreadCountSubject.next(0);
      const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
      this.notificationsSubject.next(notifications);
    });
    return result;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
