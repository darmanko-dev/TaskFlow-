import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, switchMap } from 'rxjs';

import { Project } from '../../../core/models/project.model';
import { Task, TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { NotificationService } from '../../../core/services/notification.service';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

import { ProjectMembersComponent } from '../project-members/project-members.component';
import { ActivityLogComponent } from '../../activity/activity-log/activity-log.component';

type ActiveTab = 'board' | 'list' | 'members' | 'backlog' | 'epics' | 'activity';

interface BoardColumn {
  status: TaskStatus;
  label: string;
  dotColor: string;
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    AvatarComponent,
    EmptyStateComponent,
    ProjectMembersComponent,
    ActivityLogComponent
  ],
  template: `
    <!-- Loading -->
    <app-loading-spinner *ngIf="loading" message="Loading project..."></app-loading-spinner>

    <div *ngIf="!loading && project" class="animate-fadeIn">
      <!-- Back Navigation -->
      <button (click)="goBack()"
              class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <i class="fas fa-arrow-left"></i>
        Back to Projects
      </button>

      <!-- Project Header -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2 flex-wrap">
              <h1 class="text-2xl font-bold text-gray-900 truncate">{{ project.name }}</h1>
              <app-status-badge [status]="project.status"></app-status-badge>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <span class="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{{ project.key }}</span>
              <span *ngIf="project.startDate">
                <i class="far fa-calendar mr-1"></i>
                {{ project.startDate | date:'mediumDate' }}
                <span *ngIf="project.endDate"> - {{ project.endDate | date:'mediumDate' }}</span>
              </span>
              <span>
                <i class="fas fa-tasks mr-1"></i>
                {{ project.completedTasks }}/{{ project.totalTasks }} tasks
              </span>
            </div>
            <p *ngIf="project.description" class="mt-3 text-sm text-gray-600 max-w-2xl leading-relaxed">
              {{ project.description }}
            </p>
          </div>

          <div class="flex items-center gap-4 flex-shrink-0">
            <!-- Progress Circle -->
            <div class="relative w-14 h-14">
              <svg class="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" stroke-width="4"></circle>
                <circle cx="28" cy="28" r="24" fill="none" stroke="#6366f1" stroke-width="4"
                        stroke-linecap="round"
                        [attr.stroke-dasharray]="circumference"
                        [attr.stroke-dashoffset]="circumference * (1 - project.progressPercentage / 100)">
                </circle>
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                {{ project.progressPercentage }}%
              </span>
            </div>

            <button (click)="openTaskForm()"
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors shadow-sm">
              <i class="fas fa-plus"></i>
              Add Task
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex gap-8">
          <button *ngFor="let tab of tabs"
                  (click)="activeTab = tab.key"
                  class="relative py-3 text-sm font-medium transition-colors"
                  [ngClass]="activeTab === tab.key
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-700'">
            <i class="fas mr-2" [ngClass]="tab.icon"></i>
            {{ tab.label }}
            <span *ngIf="tab.key === 'members'"
                  class="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {{ project.members.length }}
            </span>
            <div *ngIf="activeTab === tab.key"
                 class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t"></div>
          </button>
        </nav>
      </div>

      <!-- ========== BOARD TAB ========== -->
      <div *ngIf="activeTab === 'board'" class="animate-fadeIn">
        <app-loading-spinner *ngIf="tasksLoading" message="Loading tasks..."></app-loading-spinner>

        <app-empty-state
          *ngIf="!tasksLoading && tasks.length === 0"
          icon="fa-columns"
          title="No tasks yet"
          message="Add your first task to start organizing your project work."
          actionText="Add Task"
          (action)="openTaskForm()">
        </app-empty-state>

        <!-- Kanban Board -->
        <div *ngIf="!tasksLoading && tasks.length > 0"
             class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div *ngFor="let column of boardColumns"
               class="bg-gray-50 rounded-xl p-4 min-h-[200px]">
            <!-- Column Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" [ngClass]="column.dotColor"></div>
                <h3 class="text-sm font-semibold text-gray-700">{{ column.label }}</h3>
              </div>
              <span class="text-xs bg-white text-gray-500 px-2 py-0.5 rounded-full font-medium shadow-sm">
                {{ getTasksByStatus(column.status).length }}
              </span>
            </div>

            <!-- Task Cards -->
            <div class="space-y-3">
              <div *ngFor="let task of getTasksByStatus(column.status)"
                   class="bg-white rounded-lg p-3.5 border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                   [routerLink]="['/tasks', task.id]">
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs font-mono text-gray-400">{{ task.taskKey }}</span>
                  <app-priority-badge [priority]="task.priority"></app-priority-badge>
                </div>
                <h4 class="text-sm font-medium text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {{ task.title }}
                </h4>
                <div class="flex items-center justify-between">
                  <div *ngIf="task.assignee" class="flex items-center gap-1.5">
                    <app-avatar [name]="task.assignee.fullName"
                                [imageUrl]="task.assignee.avatar || ''"
                                [size]="20">
                    </app-avatar>
                    <span class="text-xs text-gray-500">{{ task.assignee.fullName }}</span>
                  </div>
                  <span *ngIf="!task.assignee" class="text-xs text-gray-400 italic">Unassigned</span>
                  <span *ngIf="task.dueDate" class="text-xs"
                        [ngClass]="task.overdue ? 'text-red-500 font-medium' : 'text-gray-400'">
                    <i class="far fa-clock mr-0.5"></i>
                    {{ task.dueDate | date:'MMM d' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== LIST TAB ========== -->
      <div *ngIf="activeTab === 'list'" class="animate-fadeIn">
        <app-loading-spinner *ngIf="tasksLoading" message="Loading tasks..."></app-loading-spinner>

        <app-empty-state
          *ngIf="!tasksLoading && tasks.length === 0"
          icon="fa-list"
          title="No tasks yet"
          message="Add your first task to start organizing your project work."
          actionText="Add Task"
          (action)="openTaskForm()">
        </app-empty-state>

        <div *ngIf="!tasksLoading && tasks.length > 0"
             class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <!-- Table Header -->
          <div class="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div class="col-span-1">Key</div>
            <div class="col-span-4">Title</div>
            <div class="col-span-2">Status</div>
            <div class="col-span-1">Priority</div>
            <div class="col-span-2">Assignee</div>
            <div class="col-span-2">Due Date</div>
          </div>

          <!-- Table Rows -->
          <div *ngFor="let task of tasks; let last = last"
               class="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors cursor-pointer"
               [class.border-b]="!last"
               [class.border-gray-100]="!last"
               [routerLink]="['/tasks', task.id]">
            <div class="md:col-span-1">
              <span class="text-xs font-mono text-gray-400">{{ task.taskKey }}</span>
            </div>
            <div class="md:col-span-4">
              <span class="text-sm font-medium text-gray-900 hover:text-primary transition-colors truncate block">
                {{ task.title }}
              </span>
            </div>
            <div class="md:col-span-2">
              <app-status-badge [status]="task.status"></app-status-badge>
            </div>
            <div class="md:col-span-1">
              <app-priority-badge [priority]="task.priority"></app-priority-badge>
            </div>
            <div class="md:col-span-2">
              <div *ngIf="task.assignee" class="flex items-center gap-2">
                <app-avatar [name]="task.assignee.fullName"
                            [imageUrl]="task.assignee.avatar || ''"
                            [size]="24">
                </app-avatar>
                <span class="text-sm text-gray-600 truncate">{{ task.assignee.fullName }}</span>
              </div>
              <span *ngIf="!task.assignee" class="text-xs text-gray-400 italic">Unassigned</span>
            </div>
            <div class="md:col-span-2">
              <span *ngIf="task.dueDate" class="text-sm"
                    [ngClass]="task.overdue ? 'text-red-500 font-medium' : 'text-gray-500'">
                {{ task.dueDate | date:'MMM d, y' }}
              </span>
              <span *ngIf="!task.dueDate" class="text-xs text-gray-400">No due date</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== MEMBERS TAB ========== -->
      <div *ngIf="activeTab === 'members'" class="animate-fadeIn">
        <app-project-members
          [project]="project"
          (memberChanged)="reloadProject()">
        </app-project-members>
      </div>

      <!-- ========== BACKLOG TAB ========== -->
      <div *ngIf="activeTab === 'backlog'" class="animate-fadeIn">
        <p class="text-sm text-gray-500 mb-4">Planifiez vos sprints et gerez le backlog du projet.</p>
        <a [routerLink]="['/projects', project.id, 'backlog']"
           class="btn btn-primary">
          <i class="fas fa-external-link-alt mr-2"></i>Ouvrir le Backlog complet
        </a>
      </div>

      <!-- ========== EPICS TAB ========== -->
      <div *ngIf="activeTab === 'epics'" class="animate-fadeIn">
        <p class="text-sm text-gray-500 mb-4">Organisez vos taches en epics pour mieux structurer votre projet.</p>
        <a [routerLink]="['/projects', project.id, 'epics']"
           class="btn btn-primary">
          <i class="fas fa-external-link-alt mr-2"></i>Gerer les Epics
        </a>
      </div>

      <!-- ========== ACTIVITY TAB ========== -->
      <div *ngIf="activeTab === 'activity'" class="animate-fadeIn">
        <app-activity-log [projectId]="project.id" [isEmbedded]="true"></app-activity-log>
      </div>
    </div>

    <!-- Not Found State -->
    <app-empty-state
      *ngIf="!loading && !project"
      icon="fa-exclamation-circle"
      title="Project not found"
      message="The project you are looking for does not exist or you do not have access to it."
      actionText="Back to Projects"
      (action)="goBack()">
    </app-empty-state>

    <!-- ========== ADD TASK MODAL ========== -->
    <div *ngIf="showTaskForm" class="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div class="absolute inset-0 bg-black/50" (click)="closeTaskForm()"></div>
      <div class="relative bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">
            Add Task to {{ project?.name }}
          </h2>
          <button (click)="closeTaskForm()"
                  class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input type="text" [(ngModel)]="taskFormData.title"
                   class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                   placeholder="Enter task title"
                   [class.border-red-500]="taskFormSubmitted && !taskFormData.title">
            <p *ngIf="taskFormSubmitted && !taskFormData.title" class="mt-1 text-xs text-red-500">
              Title is required
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea [(ngModel)]="taskFormData.description" rows="3"
                      class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                      placeholder="Describe the task"></textarea>
          </div>

          <!-- Priority & Due Date -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select [(ngModel)]="taskFormData.priority"
                      class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
              <input type="date" [(ngModel)]="taskFormData.dueDate"
                     class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
            </div>
          </div>

          <!-- Assignee -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Assignee</label>
            <select [(ngModel)]="taskFormData.assigneeId"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white">
              <option [ngValue]="null">Unassigned</option>
              <option *ngFor="let member of project?.members" [ngValue]="member.id">
                {{ member.fullName }}
              </option>
            </select>
          </div>

          <!-- Estimated Hours -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Estimated Hours</label>
            <input type="number" [(ngModel)]="taskFormData.estimatedHours" min="0" step="0.5"
                   class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                   placeholder="0">
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button (click)="closeTaskForm()"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button (click)="submitTask()"
                  [disabled]="taskSubmitting"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <span *ngIf="taskSubmitting"
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ taskSubmitting ? 'Creating...' : 'Create Task' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  project: Project | null = null;
  tasks: Task[] = [];
  loading = true;
  tasksLoading = false;

  activeTab: ActiveTab = 'board';

  readonly circumference = 2 * Math.PI * 24;

  tabs: { key: ActiveTab; label: string; icon: string }[] = [
    { key: 'board', label: 'Board', icon: 'fa-columns' },
    { key: 'list', label: 'List', icon: 'fa-list' },
    { key: 'backlog', label: 'Backlog', icon: 'fa-inbox' },
    { key: 'epics', label: 'Epics', icon: 'fa-layer-group' },
    { key: 'members', label: 'Members', icon: 'fa-users' },
    { key: 'activity', label: 'Activity', icon: 'fa-history' }
  ];

  boardColumns: BoardColumn[] = [
    { status: TaskStatus.TODO, label: 'To Do', dotColor: 'bg-slate-400' },
    { status: TaskStatus.IN_PROGRESS, label: 'In Progress', dotColor: 'bg-blue-500' },
    { status: TaskStatus.IN_REVIEW, label: 'In Review', dotColor: 'bg-purple-500' },
    { status: TaskStatus.DONE, label: 'Done', dotColor: 'bg-green-500' }
  ];

  showTaskForm = false;
  taskSubmitting = false;
  taskFormSubmitted = false;
  taskFormData = this.getEmptyTaskForm();

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          this.loading = true;
          const id = +params['id'];
          return this.projectService.getProjectById(id);
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.project = response.data;
            this.loadTasks();
          }
          this.loading = false;
        },
        error: () => {
          this.notificationService.error('Failed to load project');
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    if (!this.project) return;
    this.tasksLoading = true;

    this.taskService.getTasksByProject(this.project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.tasks = response.data;
          }
          this.tasksLoading = false;
        },
        error: () => {
          this.notificationService.error('Failed to load tasks');
          this.tasksLoading = false;
        }
      });
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  reloadProject(): void {
    if (!this.project) return;
    this.projectService.getProjectById(this.project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.project = response.data;
          }
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  openTaskForm(): void {
    this.taskFormData = this.getEmptyTaskForm();
    this.taskFormSubmitted = false;
    this.showTaskForm = true;
  }

  closeTaskForm(): void {
    this.showTaskForm = false;
  }

  submitTask(): void {
    this.taskFormSubmitted = true;
    if (!this.taskFormData.title.trim() || !this.project) return;

    this.taskSubmitting = true;

    this.taskService.createTask({
      title: this.taskFormData.title.trim(),
      description: this.taskFormData.description.trim(),
      status: TaskStatus.TODO,
      priority: this.taskFormData.priority as TaskPriority,
      projectId: this.project.id,
      assigneeId: this.taskFormData.assigneeId,
      dueDate: this.taskFormData.dueDate,
      estimatedHours: this.taskFormData.estimatedHours,
      loggedHours: 0,
      tags: []
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Task created successfully');
            this.closeTaskForm();
            this.loadTasks();
            this.reloadProject();
          }
          this.taskSubmitting = false;
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Failed to create task');
          this.taskSubmitting = false;
        }
      });
  }

  private getEmptyTaskForm() {
    return {
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM as string,
      dueDate: '',
      assigneeId: null as number | null,
      estimatedHours: 0
    };
  }
}
