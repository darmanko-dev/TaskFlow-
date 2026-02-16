import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../core/models/api-response.model';
import { User } from '../../core/models/user.model';

import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { TasksChartComponent } from './components/tasks-chart/tasks-chart.component';
import { PriorityChartComponent } from './components/priority-chart/priority-chart.component';
import { RecentTasksComponent } from './components/recent-tasks/recent-tasks.component';
import { ProjectProgressComponent } from './components/project-progress/project-progress.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    LoadingSpinnerComponent,
    StatsCardsComponent,
    TasksChartComponent,
    PriorityChartComponent,
    RecentTasksComponent,
    ProjectProgressComponent
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          Welcome back, {{ currentUser?.firstName || 'User' }}!
        </h1>
        <p class="text-gray-500 mt-1">
          Here's what's happening with your projects today, {{ today | date:'EEEE, MMMM d, yyyy' }}.
        </p>
      </div>

      <!-- Loading State -->
      <app-loading-spinner
        *ngIf="loading"
        message="Loading dashboard...">
      </app-loading-spinner>

      <!-- Dashboard Content -->
      <div *ngIf="!loading && stats" class="space-y-6">
        <!-- Stats Cards Row -->
        <app-stats-cards [stats]="stats"></app-stats-cards>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <app-tasks-chart [tasksByStatus]="stats.tasksByStatus"></app-tasks-chart>
          <app-priority-chart [tasksByPriority]="stats.tasksByPriority"></app-priority-chart>
        </div>

        <!-- Recent Tasks -->
        <app-recent-tasks [tasks]="stats.recentTasks"></app-recent-tasks>

        <!-- Project Progress -->
        <app-project-progress [projects]="stats.projectProgress"></app-project-progress>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <i class="fas fa-exclamation-circle text-red-400 text-3xl mb-3"></i>
        <p class="text-red-700 font-medium">{{ error }}</p>
        <button (click)="loadDashboard()"
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
          Try Again
        </button>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  currentUser: User | null = null;
  loading = true;
  error: string | null = null;
  today = new Date();

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        } else {
          this.error = response.message || 'Failed to load dashboard data.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
      }
    });
  }
}
