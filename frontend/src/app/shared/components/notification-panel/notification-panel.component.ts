import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { WebSocketNotificationService } from '../../../core/services/websocket.service';
import { AppNotification } from '../../../core/models/notification.model';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe],
  template: `
    <div class="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border z-50 max-h-[500px] flex flex-col">
      <!-- En-tete -->
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <h3 class="font-semibold text-gray-900">Notifications</h3>
        <button *ngIf="notifications.length > 0" (click)="markAllRead()"
                class="text-xs text-primary hover:text-primary/80 font-medium">
          Tout marquer comme lu
        </button>
      </div>

      <!-- Liste -->
      <div class="overflow-y-auto flex-1">
        <div *ngFor="let notification of notifications"
             (click)="onNotificationClick(notification)"
             class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors"
             [class.bg-blue-50]="!notification.read">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                 [ngClass]="getTypeClass(notification.type)">
              <i class="fas text-xs" [ngClass]="getTypeIcon(notification.type)"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
              <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ notification.message }}</p>
              <span class="text-xs text-gray-400 mt-1">{{ notification.createdAt | timeAgo }}</span>
            </div>
            <div *ngIf="!notification.read" class="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
          </div>
        </div>

        <div *ngIf="notifications.length === 0" class="px-4 py-8 text-center">
          <i class="fas fa-bell-slash text-2xl text-gray-300 mb-2"></i>
          <p class="text-sm text-gray-500">Aucune notification</p>
        </div>
      </div>
    </div>
  `
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  notifications: AppNotification[] = [];
  private sub?: Subscription;

  constructor(private wsService: WebSocketNotificationService) {}

  ngOnInit(): void {
    this.wsService.loadNotifications();
    this.sub = this.wsService.notifications$.subscribe(n => this.notifications = n);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onNotificationClick(notification: AppNotification): void {
    if (!notification.read) {
      this.wsService.markAsRead(notification.id);
    }
    this.close.emit();
  }

  markAllRead(): void {
    this.wsService.markAllAsRead();
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      'TASK_ASSIGNED': 'fa-user-plus',
      'TASK_STATUS_CHANGED': 'fa-exchange-alt',
      'TASK_COMMENTED': 'fa-comment',
      'SPRINT_STARTED': 'fa-play',
      'SPRINT_COMPLETED': 'fa-check'
    };
    return map[type] || 'fa-bell';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'TASK_ASSIGNED': 'bg-blue-100 text-blue-600',
      'TASK_STATUS_CHANGED': 'bg-yellow-100 text-yellow-600',
      'TASK_COMMENTED': 'bg-indigo-100 text-indigo-600',
      'SPRINT_STARTED': 'bg-green-100 text-green-600',
      'SPRINT_COMPLETED': 'bg-green-100 text-green-600'
    };
    return map[type] || 'bg-gray-100 text-gray-600';
  }
}
