import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Task, TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { Comment } from '../../../core/models/comment.model';
import { User } from '../../../core/models/user.model';
import { TaskService } from '../../../core/services/task.service';
import { CommentService } from '../../../core/services/comment.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    AvatarComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <!-- Loading -->
    <app-loading-spinner *ngIf="loading" message="Loading task..." />

    <!-- Task Detail -->
    <div *ngIf="!loading && task" class="max-w-7xl mx-auto">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm mb-6">
        <a (click)="goBack()" class="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
          <i class="fas fa-arrow-left mr-1"></i>Tasks
        </a>
        <i class="fas fa-chevron-right text-gray-300 text-[10px]"></i>
        <span class="text-gray-400">{{ task.projectName }}</span>
        <i class="fas fa-chevron-right text-gray-300 text-[10px]"></i>
        <span class="text-gray-600 font-medium">{{ task.taskKey }}</span>
      </div>

      <!-- Main Layout: Left (60%) + Right (40%) -->
      <div class="flex gap-8">

        <!-- LEFT PANEL (60%) -->
        <div class="flex-[3] min-w-0">

          <!-- Title -->
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ task.title }}</h1>

          <!-- Task Key + Project -->
          <div class="flex items-center gap-3 mb-6">
            <span class="text-sm font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {{ task.taskKey }}
            </span>
            <span class="text-sm text-gray-500">
              in <span class="font-medium text-gray-700">{{ task.projectName }}</span>
            </span>
          </div>

          <!-- Description Section -->
          <div class="mb-8">
            <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              <i class="fas fa-align-left mr-2 text-gray-400"></i>Description
            </h3>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p *ngIf="task.description" class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {{ task.description }}
              </p>
              <p *ngIf="!task.description" class="text-sm text-gray-400 italic">
                No description provided.
              </p>
            </div>
          </div>

          <!-- Comments Section -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              <i class="fas fa-comments mr-2 text-gray-400"></i>Comments
              <span class="ml-2 text-xs font-normal text-gray-400">({{ comments.length }})</span>
            </h3>

            <!-- Comment List -->
            <div class="space-y-4 mb-6">
              <div *ngFor="let comment of comments; trackBy: trackByCommentId"
                   class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-start gap-3">
                  <app-avatar
                    [name]="comment.author.fullName"
                    [imageUrl]="comment.author.avatar || ''"
                    [size]="32" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-semibold text-gray-900">{{ comment.author.fullName }}</span>
                      <span class="text-xs text-gray-400">{{ comment.createdAt | date:'MMM d, yyyy \'at\' h:mm a' }}</span>
                    </div>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
                  </div>
                </div>
              </div>

              <div *ngIf="comments.length === 0" class="text-center py-8">
                <i class="fas fa-comment-slash text-2xl text-gray-300 mb-2"></i>
                <p class="text-sm text-gray-400">No comments yet. Be the first to comment.</p>
              </div>
            </div>

            <!-- Add Comment -->
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <textarea
                [(ngModel)]="newCommentContent"
                placeholder="Write a comment..."
                rows="3"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400">
              </textarea>
              <div class="flex justify-end mt-3">
                <button
                  (click)="addComment()"
                  [disabled]="!newCommentContent.trim() || submittingComment"
                  class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors flex items-center gap-2">
                  <i class="fas fa-paper-plane text-xs"></i>
                  {{ submittingComment ? 'Posting...' : 'Add Comment' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL (40%) - Metadata -->
        <div class="flex-[2] min-w-[300px]">
          <div class="bg-white rounded-xl border border-gray-200 p-6 sticky top-6 space-y-5">

            <!-- Status -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
              <select
                [ngModel]="task.status"
                (ngModelChange)="onStatusChange($event)"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                <option *ngFor="let status of statuses" [value]="status">
                  {{ formatEnum(status) }}
                </option>
              </select>
            </div>

            <!-- Priority -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
              <select
                [ngModel]="task.priority"
                (ngModelChange)="onPriorityChange($event)"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                <option *ngFor="let priority of priorities" [value]="priority">
                  {{ formatEnum(priority) }}
                </option>
              </select>
            </div>

            <hr class="border-gray-100">

            <!-- Assignee -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assignee</label>
              <select
                [ngModel]="task.assignee?.id || ''"
                (ngModelChange)="onAssigneeChange($event)"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                <option value="">Unassigned</option>
                <option *ngFor="let user of users" [value]="user.id">
                  {{ user.fullName }}
                </option>
              </select>
              <div *ngIf="task.assignee" class="flex items-center gap-2 mt-2">
                <app-avatar
                  [name]="task.assignee.fullName"
                  [imageUrl]="task.assignee.avatar || ''"
                  [size]="28" />
                <div>
                  <p class="text-sm font-medium text-gray-700">{{ task.assignee.fullName }}</p>
                  <p class="text-xs text-gray-400">{{ task.assignee.email }}</p>
                </div>
              </div>
            </div>

            <!-- Reporter -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reporter</label>
              <div class="flex items-center gap-2">
                <app-avatar
                  [name]="task.reporter.fullName"
                  [imageUrl]="task.reporter.avatar || ''"
                  [size]="28" />
                <div>
                  <p class="text-sm font-medium text-gray-700">{{ task.reporter.fullName }}</p>
                  <p class="text-xs text-gray-400">{{ task.reporter.email }}</p>
                </div>
              </div>
            </div>

            <hr class="border-gray-100">

            <!-- Due Date -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Due Date</label>
              <div class="flex items-center gap-2">
                <i class="fas fa-calendar-alt text-sm"
                   [ngClass]="task.overdue ? 'text-red-500' : 'text-gray-400'"></i>
                <span *ngIf="task.dueDate" class="text-sm"
                      [ngClass]="task.overdue ? 'text-red-500 font-medium' : 'text-gray-700'">
                  {{ task.dueDate | date:'MMM d, yyyy' }}
                  <span *ngIf="task.overdue" class="text-xs ml-1">(Overdue)</span>
                </span>
                <span *ngIf="!task.dueDate" class="text-sm text-gray-400">Not set</span>
              </div>
            </div>

            <!-- Hours -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Estimated
                </label>
                <div class="flex items-center gap-1">
                  <i class="fas fa-clock text-sm text-gray-400"></i>
                  <span class="text-sm text-gray-700">
                    {{ task.estimatedHours ? task.estimatedHours + 'h' : '--' }}
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Logged
                </label>
                <div class="flex items-center gap-1">
                  <i class="fas fa-hourglass-half text-sm text-gray-400"></i>
                  <span class="text-sm text-gray-700">
                    {{ task.loggedHours ? task.loggedHours + 'h' : '--' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Progress Bar (if estimated hours exist) -->
            <div *ngIf="task.estimatedHours > 0">
              <div class="w-full bg-gray-200 rounded-full h-1.5">
                <div class="h-1.5 rounded-full transition-all duration-300"
                     [ngClass]="hoursPercentage > 100 ? 'bg-red-500' : 'bg-blue-500'"
                     [style.width.%]="Math.min(hoursPercentage, 100)">
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-1">{{ hoursPercentage }}% time used</p>
            </div>

            <hr class="border-gray-100">

            <!-- Tags -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tags</label>
              <div *ngIf="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1.5">
                <span *ngFor="let tag of task.tags"
                      class="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {{ tag }}
                </span>
              </div>
              <span *ngIf="!task.tags || task.tags.length === 0" class="text-sm text-gray-400">No tags</span>
            </div>

            <!-- Dates -->
            <div class="pt-2 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400">Created</span>
                <span class="text-xs text-gray-500">{{ task.createdAt | date:'MMM d, yyyy h:mm a' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400">Updated</span>
                <span class="text-xs text-gray-500">{{ task.updatedAt | date:'MMM d, yyyy h:mm a' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div *ngIf="!loading && !task && errorMessage" class="flex flex-col items-center justify-center py-20">
      <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
      <h2 class="text-lg font-semibold text-gray-700 mb-2">Task Not Found</h2>
      <p class="text-gray-500 mb-6">{{ errorMessage }}</p>
      <button (click)="goBack()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
        <i class="fas fa-arrow-left mr-2"></i>Go Back
      </button>
    </div>
  `
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  comments: Comment[] = [];
  users: User[] = [];
  loading = false;
  errorMessage = '';
  newCommentContent = '';
  submittingComment = false;

  statuses = Object.values(TaskStatus);
  priorities = Object.values(TaskPriority);

  // Expose Math to template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private commentService: CommentService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('id'));
    if (taskId) {
      this.loadTask(taskId);
      this.loadComments(taskId);
      this.loadUsers();
    } else {
      this.errorMessage = 'Invalid task ID.';
    }
  }

  loadTask(taskId: number): void {
    this.loading = true;
    this.taskService.getTaskById(taskId).subscribe({
      next: (response) => {
        if (response.success) {
          this.task = response.data;
        } else {
          this.errorMessage = response.message || 'Task not found.';
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load task.';
        this.loading = false;
      }
    });
  }

  loadComments(taskId: number): void {
    this.commentService.getComments(taskId).subscribe({
      next: (response) => {
        if (response.success) {
          this.comments = response.data;
        }
      },
      error: () => {
        // Silently fail for comments
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers(0, 100).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data.content;
        }
      },
      error: () => {
        // Silently fail for users dropdown
      }
    });
  }

  onStatusChange(newStatus: TaskStatus): void {
    if (!this.task) return;

    const previousStatus = this.task.status;
    this.task.status = newStatus;

    this.taskService.updateTaskStatus(this.task.id, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(`Status updated to ${this.formatEnum(newStatus)}`);
          if (response.data) {
            this.task = response.data;
          }
        } else {
          this.task!.status = previousStatus;
          this.notificationService.error(response.message || 'Failed to update status.');
        }
      },
      error: () => {
        this.task!.status = previousStatus;
        this.notificationService.error('Failed to update status.');
      }
    });
  }

  onPriorityChange(newPriority: TaskPriority): void {
    if (!this.task) return;

    const previousPriority = this.task.priority;
    this.task.priority = newPriority;

    this.taskService.updateTask(this.task.id, {
      title: this.task.title,
      description: this.task.description,
      status: this.task.status,
      priority: newPriority,
      projectId: this.task.projectId,
      assigneeId: this.task.assignee?.id || null,
      dueDate: this.task.dueDate,
      estimatedHours: this.task.estimatedHours,
      loggedHours: this.task.loggedHours,
      tags: this.task.tags
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(`Priority updated to ${this.formatEnum(newPriority)}`);
          if (response.data) {
            this.task = response.data;
          }
        } else {
          this.task!.priority = previousPriority;
          this.notificationService.error(response.message || 'Failed to update priority.');
        }
      },
      error: () => {
        this.task!.priority = previousPriority;
        this.notificationService.error('Failed to update priority.');
      }
    });
  }

  onAssigneeChange(userId: string): void {
    if (!this.task) return;

    const previousAssignee = this.task.assignee;
    const assigneeId = userId ? Number(userId) : null;

    this.taskService.updateTask(this.task.id, {
      title: this.task.title,
      description: this.task.description,
      status: this.task.status,
      priority: this.task.priority,
      projectId: this.task.projectId,
      assigneeId: assigneeId,
      dueDate: this.task.dueDate,
      estimatedHours: this.task.estimatedHours,
      loggedHours: this.task.loggedHours,
      tags: this.task.tags
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.task = response.data;
          this.notificationService.success('Assignee updated.');
        } else {
          this.task!.assignee = previousAssignee;
          this.notificationService.error(response.message || 'Failed to update assignee.');
        }
      },
      error: () => {
        this.task!.assignee = previousAssignee;
        this.notificationService.error('Failed to update assignee.');
      }
    });
  }

  addComment(): void {
    if (!this.task || !this.newCommentContent.trim()) return;

    this.submittingComment = true;
    this.commentService.addComment(this.task.id, this.newCommentContent.trim()).subscribe({
      next: (response) => {
        if (response.success) {
          this.comments.push(response.data);
          this.newCommentContent = '';
          this.notificationService.success('Comment added.');
        } else {
          this.notificationService.error(response.message || 'Failed to add comment.');
        }
        this.submittingComment = false;
      },
      error: () => {
        this.notificationService.error('Failed to add comment.');
        this.submittingComment = false;
      }
    });
  }

  get hoursPercentage(): number {
    if (!this.task || !this.task.estimatedHours) return 0;
    return Math.round((this.task.loggedHours / this.task.estimatedHours) * 100);
  }

  formatEnum(value: string): string {
    return value.replace(/_/g, ' ');
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  trackByCommentId(index: number, comment: Comment): number {
    return comment.id;
  }
}
