import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Task, TaskRequest, TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Modal Overlay -->
    <div *ngIf="visible"
         class="fixed inset-0 z-50 flex items-center justify-center p-4"
         (click)="onOverlayClick($event)">

      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 transition-opacity"
           [class.animate-fade-in]="visible"></div>

      <!-- Modal Content -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden
                  transform transition-all"
           [class.animate-slide-up]="visible">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            <i class="fas mr-2 text-blue-500" [ngClass]="isEditMode ? 'fa-edit' : 'fa-plus-circle'"></i>
            {{ isEditMode ? 'Edit Task' : 'Create New Task' }}
          </h2>
          <button (click)="onClose()"
                  class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400
                         hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Form Body -->
        <div class="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Title <span class="text-red-500">*</span>
              </label>
              <input type="text"
                     formControlName="title"
                     placeholder="Enter task title"
                     class="w-full px-3 py-2.5 border rounded-lg text-sm transition-colors
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            placeholder-gray-400"
                     [ngClass]="form.get('title')?.invalid && form.get('title')?.touched
                       ? 'border-red-300 bg-red-50'
                       : 'border-gray-200'">
              <p *ngIf="form.get('title')?.invalid && form.get('title')?.touched"
                 class="mt-1 text-xs text-red-500">
                Title is required.
              </p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                formControlName="description"
                placeholder="Describe the task..."
                rows="4"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400">
              </textarea>
            </div>

            <!-- Status + Priority (2 columns) -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select formControlName="status"
                        class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                  <option *ngFor="let status of statuses" [value]="status">
                    {{ formatEnum(status) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select formControlName="priority"
                        class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                  <option *ngFor="let priority of priorities" [value]="priority">
                    {{ formatEnum(priority) }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Project ID (only if not provided via input) -->
            <div *ngIf="!projectId">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Project ID <span class="text-red-500">*</span>
              </label>
              <input type="number"
                     formControlName="projectId"
                     placeholder="Enter project ID"
                     class="w-full px-3 py-2.5 border rounded-lg text-sm
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            placeholder-gray-400"
                     [ngClass]="form.get('projectId')?.invalid && form.get('projectId')?.touched
                       ? 'border-red-300 bg-red-50'
                       : 'border-gray-200'">
              <p *ngIf="form.get('projectId')?.invalid && form.get('projectId')?.touched"
                 class="mt-1 text-xs text-red-500">
                Project ID is required.
              </p>
            </div>

            <!-- Assignee -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select formControlName="assigneeId"
                      class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                <option [value]="''">Unassigned</option>
                <option *ngFor="let user of users" [value]="user.id">
                  {{ user.fullName }}
                </option>
              </select>
            </div>

            <!-- Due Date + Hours (3 columns) -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date"
                       formControlName="dueDate"
                       class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estimated (h)</label>
                <input type="number"
                       formControlName="estimatedHours"
                       placeholder="0"
                       min="0"
                       step="0.5"
                       class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                              placeholder-gray-400">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Logged (h)</label>
                <input type="number"
                       formControlName="loggedHours"
                       placeholder="0"
                       min="0"
                       step="0.5"
                       class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                              placeholder-gray-400">
              </div>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tags
                <span class="text-xs text-gray-400 font-normal ml-1">(comma-separated)</span>
              </label>
              <input type="text"
                     formControlName="tags"
                     placeholder="e.g. frontend, bug, urgent"
                     class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            placeholder-gray-400">
              <div *ngIf="tagPreview.length > 0" class="flex flex-wrap gap-1 mt-2">
                <span *ngFor="let tag of tagPreview"
                      class="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
                  {{ tag }}
                </span>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button (click)="onClose()"
                  type="button"
                  class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300
                         rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button (click)="onSubmit()"
                  type="button"
                  [disabled]="form.invalid || submitting"
                  class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors flex items-center gap-2">
            <i *ngIf="submitting" class="fas fa-spinner fa-spin text-xs"></i>
            <i *ngIf="!submitting" class="fas text-xs" [ngClass]="isEditMode ? 'fa-save' : 'fa-plus'"></i>
            {{ submitting ? 'Saving...' : (isEditMode ? 'Update Task' : 'Create Task') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
    }
  `]
})
export class TaskFormComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() task: Task | null = null;
  @Input() projectId?: number;

  @Output() saved = new EventEmitter<Task>();
  @Output() closed = new EventEmitter<void>();

  form!: FormGroup;
  users: User[] = [];
  submitting = false;

  statuses = Object.values(TaskStatus);
  priorities = Object.values(TaskPriority);

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.populateForm();
    }
    if (changes['task'] && this.form) {
      this.populateForm();
    }
  }

  get isEditMode(): boolean {
    return !!this.task;
  }

  get tagPreview(): string[] {
    const tagsValue = this.form?.get('tags')?.value || '';
    return tagsValue
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      status: [TaskStatus.TODO],
      priority: [TaskPriority.MEDIUM],
      projectId: [this.projectId || '', this.projectId ? [] : [Validators.required]],
      assigneeId: [''],
      dueDate: [''],
      estimatedHours: [0],
      loggedHours: [0],
      tags: ['']
    });
  }

  private populateForm(): void {
    if (!this.form) return;

    if (this.task) {
      this.form.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        status: this.task.status,
        priority: this.task.priority,
        projectId: this.task.projectId,
        assigneeId: this.task.assignee?.id || '',
        dueDate: this.task.dueDate || '',
        estimatedHours: this.task.estimatedHours || 0,
        loggedHours: this.task.loggedHours || 0,
        tags: this.task.tags?.join(', ') || ''
      });
    } else {
      this.form.reset({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: this.projectId || '',
        assigneeId: '',
        dueDate: '',
        estimatedHours: 0,
        loggedHours: 0,
        tags: ''
      });
    }
  }

  private loadUsers(): void {
    this.userService.getUsers(0, 100).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data.content;
        }
      },
      error: () => {
        // Users dropdown will just be empty
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;

    this.form.markAllAsTouched();

    const formValue = this.form.value;

    const taskRequest: TaskRequest = {
      title: formValue.title.trim(),
      description: formValue.description?.trim() || '',
      status: formValue.status,
      priority: formValue.priority,
      projectId: this.projectId || Number(formValue.projectId),
      assigneeId: formValue.assigneeId ? Number(formValue.assigneeId) : null,
      dueDate: formValue.dueDate || '',
      estimatedHours: Number(formValue.estimatedHours) || 0,
      loggedHours: Number(formValue.loggedHours) || 0,
      tags: formValue.tags
        ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
        : []
    };

    this.submitting = true;

    const request$ = this.isEditMode
      ? this.taskService.updateTask(this.task!.id, taskRequest)
      : this.taskService.createTask(taskRequest);

    request$.subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(
            this.isEditMode ? 'Task updated successfully.' : 'Task created successfully.'
          );
          this.saved.emit(response.data);
          this.onClose();
        } else {
          this.notificationService.error(response.message || 'Failed to save task.');
        }
        this.submitting = false;
      },
      error: () => {
        this.notificationService.error('Failed to save task. Please try again.');
        this.submitting = false;
      }
    });
  }

  onClose(): void {
    this.closed.emit();
    this.submitting = false;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.onClose();
    }
  }

  formatEnum(value: string): string {
    return value.replace(/_/g, ' ');
  }
}
