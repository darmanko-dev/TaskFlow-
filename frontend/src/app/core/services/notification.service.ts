import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly AUTO_DISMISS_MS = 5000;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  success(message: string): void {
    this.addNotification('success', message);
  }

  error(message: string): void {
    this.addNotification('error', message);
  }

  warning(message: string): void {
    this.addNotification('warning', message);
  }

  info(message: string): void {
    this.addNotification('info', message);
  }

  dismiss(id: string): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  private addNotification(type: NotificationType, message: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      timestamp: new Date()
    };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, notification]);

    setTimeout(() => {
      this.dismiss(notification.id);
    }, this.AUTO_DISMISS_MS);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
