import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Task } from '../../../../core/models/task.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../../shared/components/priority-badge/priority-badge.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-recent-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    AvatarComponent
  ],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>

      <div class="overflow-x-auto">
        <table class="w-full text-sm" *ngIf="tasks && tasks.length > 0; else emptyState">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Key</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Title</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Priority</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Assignee</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of tasks"
                class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="py-3 px-4">
                <a [routerLink]="['/tasks', task.id]"
                   class="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                  {{ task.taskKey }}
                </a>
              </td>
              <td class="py-3 px-4 text-gray-900 font-medium max-w-xs truncate">
                {{ task.title }}
              </td>
              <td class="py-3 px-4">
                <app-status-badge [status]="task.status"></app-status-badge>
              </td>
              <td class="py-3 px-4">
                <app-priority-badge [priority]="task.priority"></app-priority-badge>
              </td>
              <td class="py-3 px-4">
                <div *ngIf="task.assignee" class="flex items-center gap-2">
                  <app-avatar
                    [name]="task.assignee.fullName"
                    [imageUrl]="task.assignee.avatar || ''"
                    [size]="28">
                  </app-avatar>
                  <span class="text-gray-700 text-xs">{{ task.assignee.fullName }}</span>
                </div>
                <span *ngIf="!task.assignee" class="text-gray-400 text-xs italic">Unassigned</span>
              </td>
              <td class="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                {{ task.createdAt | date:'MMM d, yyyy' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #emptyState>
        <div class="text-center py-8 text-gray-400">
          <i class="fas fa-inbox text-3xl mb-2"></i>
          <p class="text-sm">No recent tasks found</p>
        </div>
      </ng-template>
    </div>
  `
})
export class RecentTasksComponent {
  @Input() tasks: Task[] = [];
}
