import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Project, ProjectStatus } from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';
import { NotificationService } from '../../../core/services/notification.service';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

import { ProjectFormComponent } from '../project-form/project-form.component';

interface FilterTab {
  label: string;
  value: ProjectStatus | null;
  count: number;
}

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    AvatarComponent,
    ConfirmDialogComponent,
    TruncatePipe,
    TimeAgoPipe,
    ProjectFormComponent
  ],
  template: `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Projects</h1>
        <p class="mt-1 text-sm text-gray-500">Manage and track all your projects</p>
      </div>
      <button (click)="openCreateModal()"
              class="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors shadow-sm">
        <i class="fas fa-plus"></i>
        New Project
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1 overflow-x-auto">
      <button *ngFor="let tab of filterTabs"
              (click)="onFilterChange(tab.value)"
              class="px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all"
              [ngClass]="activeFilter === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'">
        {{ tab.label }}
        <span class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
              [ngClass]="activeFilter === tab.value
                ? 'bg-primary/10 text-primary'
                : 'bg-gray-200 text-gray-500'">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Loading State -->
    <app-loading-spinner *ngIf="loading" message="Loading projects..."></app-loading-spinner>

    <!-- Empty State -->
    <app-empty-state
      *ngIf="!loading && projects.length === 0"
      icon="fa-folder-open"
      title="No projects found"
      [message]="activeFilter ? 'No projects match the selected filter. Try a different filter or create a new project.' : 'Get started by creating your first project to organize your tasks.'"
      actionText="Create Project"
      (action)="openCreateModal()">
    </app-empty-state>

    <!-- Project Grid -->
    <div *ngIf="!loading && projects.length > 0"
         class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div *ngFor="let project of projects"
           class="bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-200 overflow-hidden group">
        <!-- Card Header -->
        <div class="p-5 pb-3">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <a [routerLink]="['/projects', project.id]"
                 class="text-lg font-semibold text-gray-900 hover:text-primary transition-colors block truncate">
                {{ project.name }}
              </a>
              <span class="text-xs text-gray-400 font-mono">{{ project.key }}</span>
            </div>
            <app-status-badge [status]="project.status" class="ml-2 flex-shrink-0"></app-status-badge>
          </div>

          <p class="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {{ project.description | truncate:120 }}
          </p>
        </div>

        <!-- Progress Bar -->
        <div class="px-5 mb-4">
          <div class="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Progress</span>
            <span class="font-medium">{{ project.progressPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="h-2 rounded-full transition-all duration-500"
                 [ngClass]="{
                   'bg-green-500': project.progressPercentage >= 75,
                   'bg-blue-500': project.progressPercentage >= 40 && project.progressPercentage < 75,
                   'bg-yellow-500': project.progressPercentage >= 10 && project.progressPercentage < 40,
                   'bg-gray-300': project.progressPercentage < 10
                 }"
                 [ngStyle]="{'width.%': project.progressPercentage}">
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-400 mt-1">
            <span>{{ project.completedTasks }} / {{ project.totalTasks }} tasks</span>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <!-- Member Avatars (stacked) -->
          <div class="flex items-center">
            <div class="flex -space-x-2">
              <div *ngFor="let member of project.members | slice:0:4; let i = index"
                   class="relative ring-2 ring-white rounded-full"
                   [ngStyle]="{'z-index': 10 - i}">
                <app-avatar [name]="member.fullName"
                            [imageUrl]="member.avatar || ''"
                            [size]="28">
                </app-avatar>
              </div>
              <div *ngIf="project.members.length > 4"
                   class="relative z-0 w-7 h-7 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center">
                <span class="text-xs text-gray-500 font-medium">+{{ project.members.length - 4 }}</span>
              </div>
            </div>
          </div>

          <!-- Date & Actions -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">
              <i class="far fa-calendar mr-1"></i>{{ project.updatedAt | timeAgo }}
            </span>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="openEditModal(project); $event.stopPropagation()"
                      class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                      title="Edit project">
                <i class="fas fa-pen text-xs"></i>
              </button>
              <button (click)="confirmDelete(project); $event.stopPropagation()"
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete project">
                <i class="fas fa-trash-alt text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div *ngIf="!loading && totalPages > 1"
         class="mt-8 flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Showing {{ projects.length }} of {{ totalElements }} projects
      </p>
      <div class="flex items-center gap-2">
        <button (click)="onPageChange(currentPage - 1)"
                [disabled]="currentPage === 0"
                class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <i class="fas fa-chevron-left mr-1 text-xs"></i> Previous
        </button>
        <span class="text-sm text-gray-500">
          Page {{ currentPage + 1 }} of {{ totalPages }}
        </span>
        <button (click)="onPageChange(currentPage + 1)"
                [disabled]="currentPage >= totalPages - 1"
                class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Next <i class="fas fa-chevron-right ml-1 text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Project Form Modal -->
    <app-project-form
      [visible]="showFormModal"
      [project]="selectedProject"
      (saved)="onProjectSaved()"
      (closed)="closeFormModal()">
    </app-project-form>

    <!-- Confirm Delete Dialog -->
    <app-confirm-dialog
      [visible]="showDeleteDialog"
      title="Delete Project"
      [message]="'Are you sure you want to delete \\'' + (projectToDelete?.name || '') + '\\'? This action cannot be undone and will remove all associated tasks.'"
      confirmText="Delete Project"
      type="danger"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="showDeleteDialog = false">
    </app-confirm-dialog>
  `
})
export class ProjectListComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  loading = true;

  activeFilter: ProjectStatus | null = null;
  filterTabs: FilterTab[] = [
    { label: 'All', value: null, count: 0 },
    { label: 'Active', value: ProjectStatus.IN_PROGRESS, count: 0 },
    { label: 'Completed', value: ProjectStatus.COMPLETED, count: 0 },
    { label: 'Archived', value: ProjectStatus.CANCELLED, count: 0 }
  ];

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 9;

  showFormModal = false;
  selectedProject: Project | null = null;

  showDeleteDialog = false;
  projectToDelete: Project | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadFilterCounts();

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['create'] === 'true') {
          this.openCreateModal();
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.loading = true;
    const status = this.activeFilter || undefined;

    this.projectService.getProjects(status, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.projects = response.data.content;
            this.totalPages = response.data.totalPages;
            this.totalElements = response.data.totalElements;
          }
          this.loading = false;
        },
        error: () => {
          this.notificationService.error('Failed to load projects');
          this.loading = false;
        }
      });
  }

  loadFilterCounts(): void {
    this.projectService.getProjects(undefined, 0, 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res.success) {
          this.filterTabs[0].count = res.data.totalElements;
        }
      });

    const statuses: (ProjectStatus | null)[] = [
      ProjectStatus.IN_PROGRESS,
      ProjectStatus.COMPLETED,
      ProjectStatus.CANCELLED
    ];

    statuses.forEach((status, index) => {
      if (status) {
        this.projectService.getProjects(status, 0, 1)
          .pipe(takeUntil(this.destroy$))
          .subscribe(res => {
            if (res.success) {
              this.filterTabs[index + 1].count = res.data.totalElements;
            }
          });
      }
    });
  }

  onFilterChange(status: ProjectStatus | null): void {
    this.activeFilter = status;
    this.currentPage = 0;
    this.loadProjects();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProjects();
  }

  openCreateModal(): void {
    this.selectedProject = null;
    this.showFormModal = true;
  }

  openEditModal(project: Project): void {
    this.selectedProject = project;
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.selectedProject = null;
  }

  onProjectSaved(): void {
    this.closeFormModal();
    this.loadProjects();
    this.loadFilterCounts();
  }

  confirmDelete(project: Project): void {
    this.projectToDelete = project;
    this.showDeleteDialog = true;
  }

  onDeleteConfirmed(): void {
    if (!this.projectToDelete) return;

    this.projectService.deleteProject(this.projectToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Project deleted successfully');
            this.loadProjects();
            this.loadFilterCounts();
          }
          this.showDeleteDialog = false;
          this.projectToDelete = null;
        },
        error: () => {
          this.notificationService.error('Failed to delete project');
          this.showDeleteDialog = false;
          this.projectToDelete = null;
        }
      });
  }
}
