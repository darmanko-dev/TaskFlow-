import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ActivityService } from '../../../core/services/activity.service';
import { ActivityLog } from '../../../core/models/activity.model';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent, TimeAgoPipe, LoadingSpinnerComponent],
  template: `
    <div class="p-6" *ngIf="!isEmbedded">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Activity Log</h1>
      <p class="text-gray-500 text-sm mb-6">Track all changes and actions across the project</p>
    </div>

    <div [class.p-6]="!isEmbedded">
      <div *ngIf="loading" class="flex justify-center py-8">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <div *ngIf="!loading" class="relative">
        <!-- Timeline line -->
        <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div *ngFor="let activity of activities; let last = last" class="relative flex gap-4 pb-6" [class.pb-0]="last">
          <!-- Icon -->
          <div class="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
               [ngClass]="getActionClass(activity.action)">
            <i class="fas text-xs" [ngClass]="getActionIcon(activity.action)"></i>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <app-avatar [name]="activity.user?.fullName || ''" [size]="20"></app-avatar>
              <span class="font-medium text-sm text-gray-900">{{ activity.user?.fullName }}</span>
              <span class="text-sm text-gray-500">{{ getActionLabel(activity.action) }}</span>
              <a *ngIf="activity.entityType === 'TASK'" [routerLink]="['/tasks', activity.entityId]"
                 class="text-sm font-medium text-primary hover:underline">{{ activity.entityName }}</a>
              <span *ngIf="activity.entityType !== 'TASK'" class="text-sm font-medium text-gray-700">{{ activity.entityName }}</span>
            </div>
            <p *ngIf="activity.details" class="text-xs text-gray-400 mt-0.5">{{ activity.details }}</p>
            <span class="text-xs text-gray-400">{{ activity.createdAt | timeAgo }}</span>
          </div>
        </div>

        <div *ngIf="activities.length === 0" class="text-center py-8">
          <i class="fas fa-history text-3xl text-gray-300 mb-2"></i>
          <p class="text-gray-500 text-sm">No activity yet</p>
        </div>

        <!-- Load More -->
        <div *ngIf="hasMore" class="mt-4 text-center">
          <button (click)="loadMore()" class="btn btn-secondary text-sm">Load more</button>
        </div>
      </div>
    </div>
  `
})
export class ActivityLogComponent implements OnInit {
  @Input() projectId?: number;
  @Input() entityType?: string;
  @Input() entityId?: number;
  @Input() isEmbedded = false;

  activities: ActivityLog[] = [];
  loading = true;
  page = 0;
  hasMore = true;

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading = true;
    const obs = this.entityType && this.entityId
      ? this.activityService.getEntityActivities(this.entityType, this.entityId, this.page)
      : this.projectId
        ? this.activityService.getProjectActivities(this.projectId, this.page)
        : this.activityService.getAllActivities(this.page);

    obs.subscribe(res => {
      if (res.success) {
        this.activities = [...this.activities, ...res.data.content];
        this.hasMore = !res.data.last;
      }
      this.loading = false;
    });
  }

  loadMore(): void {
    this.page++;
    this.loadActivities();
  }

  getActionIcon(action: string): string {
    const map: Record<string, string> = {
      'CREATED': 'fa-plus',
      'UPDATED': 'fa-edit',
      'DELETED': 'fa-trash',
      'STATUS_CHANGED': 'fa-exchange-alt',
      'STARTED': 'fa-play',
      'COMPLETED': 'fa-check',
      'ATTACHED_FILE': 'fa-paperclip',
      'REMOVED_FILE': 'fa-times',
      'COMMENTED': 'fa-comment'
    };
    return map[action] || 'fa-circle';
  }

  getActionClass(action: string): string {
    const map: Record<string, string> = {
      'CREATED': 'bg-green-100 text-green-600',
      'UPDATED': 'bg-blue-100 text-blue-600',
      'DELETED': 'bg-red-100 text-red-600',
      'STATUS_CHANGED': 'bg-yellow-100 text-yellow-600',
      'STARTED': 'bg-indigo-100 text-indigo-600',
      'COMPLETED': 'bg-green-100 text-green-600',
      'ATTACHED_FILE': 'bg-purple-100 text-purple-600',
      'REMOVED_FILE': 'bg-gray-100 text-gray-600',
      'COMMENTED': 'bg-blue-100 text-blue-600'
    };
    return map[action] || 'bg-gray-100 text-gray-600';
  }

  getActionLabel(action: string): string {
    const map: Record<string, string> = {
      'CREATED': 'created',
      'UPDATED': 'updated',
      'DELETED': 'deleted',
      'STATUS_CHANGED': 'changed status of',
      'STARTED': 'started',
      'COMPLETED': 'completed',
      'ATTACHED_FILE': 'attached a file to',
      'REMOVED_FILE': 'removed a file from',
      'COMMENTED': 'commented on'
    };
    return map[action] || action.toLowerCase();
  }
}
