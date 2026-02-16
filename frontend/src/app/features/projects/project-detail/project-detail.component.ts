import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Project } from '../../../core/models/project.model';
import { Task } from '../../../core/models/task.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TaskBoardComponent } from '../../tasks/task-board/task-board.component';
import { TaskListComponent } from '../../tasks/task-list/task-list.component';
import { TaskFormComponent } from '../../tasks/task-form/task-form.component';
import { ProjectMembersComponent } from '../project-members/project-members.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, LoadingSpinnerComponent,
            TaskBoardComponent, TaskListComponent, TaskFormComponent, ProjectMembersComponent, AvatarComponent],
  template: `
    <div *ngIf="loading" class="py-12">
      <app-loading-spinner></app-loading-spinner>
    </div>

    <div *ngIf="!loading && project" class="animate-fadeIn">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-2xl font-bold text-gray-900">{{ project.name }}</h1>
            <app-status-badge [status]="project.status"></app-status-badge>
            <span class="text-sm text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">{{ project.key }}</span>
          </div>
          <p class="text-gray-500 text-sm">{{ project.description }}</p>
        </div>
        <button (click)="showTaskForm = true"
                class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
          <i class="fas fa-plus mr-2"></i>Add Task
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button (click)="activeTab = 'board'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-all"
                [class]="activeTab === 'board' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          <i class="fas fa-columns mr-2"></i>Board
        </button>
        <button (click)="activeTab = 'list'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-all"
                [class]="activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          <i class="fas fa-list mr-2"></i>List
        </button>
        <button (click)="activeTab = 'members'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-all"
                [class]="activeTab === 'members' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          <i class="fas fa-users mr-2"></i>Members
        </button>
      </div>

      <!-- Tab Content -->
      <div [ngSwitch]="activeTab">
        <app-task-board *ngSwitchCase="'board'" [projectId]="project.id"></app-task-board>
        <app-task-list *ngSwitchCase="'list'" [projectId]="project.id"></app-task-list>
        <app-project-members *ngSwitchCase="'members'" [project]="project" (memberChanged)="loadProject()"></app-project-members>
      </div>

      <!-- Task Form Modal -->
      <app-task-form
        [visible]="showTaskForm"
        [projectId]="project.id"
        (saved)="onTaskSaved()"
        (closed)="showTaskForm = false">
      </app-task-form>
    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  loading = true;
  activeTab: 'board' | 'list' | 'members' = 'board';
  showTaskForm = false;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const view = this.route.snapshot.data?.['view'];
    if (view) this.activeTab = view;
    this.loadProject();
  }

  loadProject(): void {
    const id = this.route.snapshot.params['id'];
    this.projectService.getProjectById(id).subscribe({
      next: (res) => {
        this.project = res.data;
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Failed to load project');
        this.loading = false;
      }
    });
  }

  onTaskSaved(): void {
    this.showTaskForm = false;
    this.loadProject();
  }
}
