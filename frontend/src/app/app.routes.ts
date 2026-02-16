import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  // Auth routes
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  // Main app routes
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent)
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
      },
      {
        path: 'projects/:id/board',
        loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
        data: { view: 'board' }
      },
      {
        path: 'projects/:id/list',
        loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
        data: { view: 'list' }
      },
      {
        path: 'projects/:id/backlog',
        loadComponent: () => import('./features/sprints/sprint-backlog/sprint-backlog.component').then(m => m.SprintBacklogComponent)
      },
      {
        path: 'projects/:id/epics',
        loadComponent: () => import('./features/epics/epic-list/epic-list.component').then(m => m.EpicListComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent)
      },
      {
        path: 'tasks/:id',
        loadComponent: () => import('./features/tasks/task-detail/task-detail.component').then(m => m.TaskDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'activity',
        loadComponent: () => import('./features/activity/activity-log/activity-log.component').then(m => m.ActivityLogComponent)
      },
      {
        path: 'projects/:id/automations',
        loadComponent: () => import('./features/automation/automation-list/automation-list.component').then(m => m.AutomationListComponent)
      },
      {
        path: 'projects/:id/labels',
        loadComponent: () => import('./shared/components/label-manager/label-manager.component').then(m => m.LabelManagerComponent)
      },
      {
        path: 'sprints/:sprintId/report',
        loadComponent: () => import('./features/reports/sprint-report/sprint-report.component').then(m => m.SprintReportComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
