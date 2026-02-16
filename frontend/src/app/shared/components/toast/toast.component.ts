import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <div *ngFor="let notification of notifications"
           class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-slideIn"
           [ngClass]="getClasses(notification.type)">
        <i class="fas" [ngClass]="getIcon(notification.type)"></i>
        <p class="text-sm font-medium flex-1">{{ notification.message }}</p>
        <button (click)="dismiss(notification.id)" class="text-current opacity-60 hover:opacity-100">
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    </div>
  `
})
export class ToastComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(
      notifications => this.notifications = notifications
    );
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  getClasses(type: string): string {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-800 border-green-200';
      case 'error': return 'bg-red-50 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-info-circle';
    }
  }
}
