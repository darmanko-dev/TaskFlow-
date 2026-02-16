import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Task } from '../../../core/models/task.model';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, PriorityBadgeComponent, AvatarComponent],
  template: `
    <div
      class="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer
             hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
      (click)="navigateToTask()">

      <!-- Task Key -->
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-mono text-gray-400 tracking-wide">{{ task.taskKey }}</span>
        <app-priority-badge [priority]="task.priority" />
      </div>

      <!-- Title -->
      <h4 class="text-sm font-medium text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {{ task.title }}
      </h4>

      <!-- Tags -->
      <div *ngIf="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
        <span
          *ngFor="let tag of task.tags; let i = index"
          class="inline-block px-2 py-0.5 rounded text-[10px] font-medium"
          [ngClass]="tagColors[i % tagColors.length]">
          {{ tag }}
        </span>
      </div>

      <!-- Footer: Assignee + Due Date -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <ng-container *ngIf="task.assignee">
            <app-avatar
              [name]="task.assignee.fullName"
              [imageUrl]="task.assignee.avatar || ''"
              [size]="24" />
            <span class="text-xs text-gray-500 truncate max-w-[80px]">
              {{ task.assignee.firstName }}
            </span>
          </ng-container>
          <span *ngIf="!task.assignee" class="text-xs text-gray-400 italic">Unassigned</span>
        </div>

        <div *ngIf="task.dueDate" class="flex items-center gap-1">
          <i class="fas fa-calendar-alt text-[10px]"
             [ngClass]="task.overdue ? 'text-red-500' : 'text-gray-400'"></i>
          <span class="text-xs"
                [ngClass]="task.overdue ? 'text-red-500 font-medium' : 'text-gray-400'">
            {{ task.dueDate | date:'MMM d' }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;

  tagColors: string[] = [
    'bg-blue-50 text-blue-600',
    'bg-purple-50 text-purple-600',
    'bg-amber-50 text-amber-600',
    'bg-emerald-50 text-emerald-600',
    'bg-rose-50 text-rose-600',
    'bg-cyan-50 text-cyan-600'
  ];

  constructor(private router: Router) {}

  navigateToTask(): void {
    this.router.navigate(['/tasks', this.task.id]);
  }
}
