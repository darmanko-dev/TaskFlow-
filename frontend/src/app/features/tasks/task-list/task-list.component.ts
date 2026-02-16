import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Task, TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { Page } from '../../../core/models/api-response.model';
import { TaskService } from '../../../core/services/task.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

type SortField = 'taskKey' | 'title' | 'status' | 'priority' | 'assignee' | 'dueDate' | 'createdAt';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    AvatarComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <!-- Loading -->
    <app-loading-spinner *ngIf="loading" message="Loading tasks..." />

    <!-- Empty State -->
    <app-empty-state
      *ngIf="!loading && tasks.length === 0 && !errorMessage"
      icon="fa-tasks"
      title="No tasks found"
      message="There are no tasks to display. Create a new task to get started."
      actionText="Create Task"
      (action)="onCreateTask()" />

    <!-- Error State -->
    <div *ngIf="!loading && errorMessage" class="flex flex-col items-center justify-center py-16">
      <i class="fas fa-exclamation-circle text-3xl text-red-400 mb-3"></i>
      <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
      <button (click)="loadTasks()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
        <i class="fas fa-redo mr-2"></i>Retry
      </button>
    </div>

    <!-- Task Table -->
    <div *ngIf="!loading && tasks.length > 0" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <!-- Select All Checkbox -->
              <th class="w-12 px-4 py-3">
                <input type="checkbox"
                       [checked]="allSelected"
                       [indeterminate]="someSelected"
                       (change)="toggleSelectAll()"
                       class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
              </th>

              <!-- Sortable Headers -->
              <th *ngFor="let col of tableColumns"
                  class="px-4 py-3 text-left cursor-pointer select-none group hover:bg-gray-100 transition-colors"
                  (click)="onSort(col.field)">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ col.label }}</span>
                  <span class="text-gray-400" *ngIf="sortField === col.field">
                    <i class="fas text-[10px]"
                       [ngClass]="sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'"></i>
                  </span>
                  <span class="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        *ngIf="sortField !== col.field">
                    <i class="fas fa-sort text-[10px]"></i>
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let task of sortedTasks; trackBy: trackByTaskId"
                class="border-b border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer"
                (click)="navigateToTask(task)">

              <!-- Checkbox -->
              <td class="px-4 py-3" (click)="$event.stopPropagation()">
                <input type="checkbox"
                       [checked]="selectedIds.has(task.id)"
                       (change)="toggleSelection(task.id)"
                       class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
              </td>

              <!-- Key -->
              <td class="px-4 py-3">
                <span class="text-xs font-mono text-gray-400 font-medium">{{ task.taskKey }}</span>
              </td>

              <!-- Title -->
              <td class="px-4 py-3">
                <span class="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {{ task.title }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-4 py-3">
                <app-status-badge [status]="task.status" />
              </td>

              <!-- Priority -->
              <td class="px-4 py-3">
                <app-priority-badge [priority]="task.priority" />
              </td>

              <!-- Assignee -->
              <td class="px-4 py-3">
                <div *ngIf="task.assignee" class="flex items-center gap-2">
                  <app-avatar
                    [name]="task.assignee.fullName"
                    [imageUrl]="task.assignee.avatar || ''"
                    [size]="24" />
                  <span class="text-sm text-gray-600">{{ task.assignee.fullName }}</span>
                </div>
                <span *ngIf="!task.assignee" class="text-sm text-gray-400 italic">Unassigned</span>
              </td>

              <!-- Due Date -->
              <td class="px-4 py-3">
                <span *ngIf="task.dueDate" class="text-sm"
                      [ngClass]="task.overdue ? 'text-red-500 font-medium' : 'text-gray-500'">
                  <i *ngIf="task.overdue" class="fas fa-exclamation-triangle text-[10px] mr-1"></i>
                  {{ task.dueDate | date:'MMM d, yyyy' }}
                </span>
                <span *ngIf="!task.dueDate" class="text-sm text-gray-400">--</span>
              </td>

              <!-- Created -->
              <td class="px-4 py-3">
                <span class="text-sm text-gray-500">{{ task.createdAt | date:'MMM d, yyyy' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">
            Showing {{ (currentPage * pageSize) + 1 }} to {{ Math.min((currentPage + 1) * pageSize, totalElements) }}
            of {{ totalElements }} tasks
          </span>
          <span *ngIf="selectedIds.size > 0" class="text-sm text-blue-600 font-medium">
            ({{ selectedIds.size }} selected)
          </span>
        </div>

        <div class="flex items-center gap-1">
          <button
            (click)="goToPage(0)"
            [disabled]="currentPage === 0"
            class="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 0"
            class="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <i class="fas fa-angle-left"></i>
          </button>

          <ng-container *ngFor="let page of visiblePages">
            <button
              (click)="goToPage(page)"
              class="w-8 h-8 text-sm rounded transition-colors"
              [ngClass]="page === currentPage
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-200'">
              {{ page + 1 }}
            </button>
          </ng-container>

          <button
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage >= totalPages - 1"
            class="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <i class="fas fa-angle-right"></i>
          </button>
          <button
            (click)="goToPage(totalPages - 1)"
            [disabled]="currentPage >= totalPages - 1"
            class="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  `
})
export class TaskListComponent implements OnInit, OnChanges {
  @Input() projectId?: number;

  tasks: Task[] = [];
  loading = false;
  errorMessage = '';

  // Sorting
  sortField: SortField = 'createdAt';
  sortDirection: SortDirection = 'desc';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Selection
  selectedIds = new Set<number>();

  // Expose Math to template
  Math = Math;

  tableColumns: { field: SortField; label: string }[] = [
    { field: 'taskKey', label: 'Key' },
    { field: 'title', label: 'Title' },
    { field: 'status', label: 'Status' },
    { field: 'priority', label: 'Priority' },
    { field: 'assignee', label: 'Assignee' },
    { field: 'dueDate', label: 'Due Date' },
    { field: 'createdAt', label: 'Created' }
  ];

  constructor(
    private taskService: TaskService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && !changes['projectId'].firstChange) {
      this.currentPage = 0;
      this.selectedIds.clear();
      this.loadTasks();
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';

    const request$ = this.projectId
      ? this.taskService.getTasksByProject(this.projectId)
      : this.taskService.getMyTasks(this.currentPage, this.pageSize);

    request$.subscribe({
      next: (response) => {
        if (response.success) {
          if (Array.isArray(response.data)) {
            // getTasksByProject returns Task[]
            this.tasks = response.data;
            this.totalElements = response.data.length;
            this.totalPages = Math.ceil(this.totalElements / this.pageSize);
          } else {
            // Paginated response
            const page = response.data as unknown as Page<Task>;
            this.tasks = page.content;
            this.totalElements = page.totalElements;
            this.totalPages = page.totalPages;
          }
        } else {
          this.errorMessage = response.message || 'Failed to load tasks.';
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load tasks. Please try again.';
        this.loading = false;
      }
    });
  }

  // Sorting
  onSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedTasks(): Task[] {
    const priorityOrder: Record<string, number> = {
      [TaskPriority.CRITICAL]: 0,
      [TaskPriority.HIGH]: 1,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.LOW]: 3
    };

    const statusOrder: Record<string, number> = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 1,
      [TaskStatus.IN_REVIEW]: 2,
      [TaskStatus.DONE]: 3
    };

    return [...this.tasks].sort((a, b) => {
      let comparison = 0;

      switch (this.sortField) {
        case 'taskKey':
          comparison = a.taskKey.localeCompare(b.taskKey);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
          break;
        case 'priority':
          comparison = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
          break;
        case 'assignee':
          const nameA = a.assignee?.fullName || 'zzz';
          const nameB = b.assignee?.fullName || 'zzz';
          comparison = nameA.localeCompare(nameB);
          break;
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          comparison = dateA - dateB;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Selection
  get allSelected(): boolean {
    return this.tasks.length > 0 && this.selectedIds.size === this.tasks.length;
  }

  get someSelected(): boolean {
    return this.selectedIds.size > 0 && this.selectedIds.size < this.tasks.length;
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedIds.clear();
    } else {
      this.tasks.forEach(t => this.selectedIds.add(t.id));
    }
  }

  toggleSelection(taskId: number): void {
    if (this.selectedIds.has(taskId)) {
      this.selectedIds.delete(taskId);
    } else {
      this.selectedIds.add(taskId);
    }
  }

  // Pagination
  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.selectedIds.clear();
      this.loadTasks();
    }
  }

  // Navigation
  navigateToTask(task: Task): void {
    this.router.navigate(['/tasks', task.id]);
  }

  onCreateTask(): void {
    // This would typically emit an event or open a dialog
    this.router.navigate(['/tasks/new']);
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }
}
