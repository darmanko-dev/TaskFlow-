import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReportService } from '../../../core/services/report.service';
import { SprintReport } from '../../../core/models/sprint-report.model';

@Component({
  selector: 'app-sprint-report',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 page-enter">
      <div class="flex items-center gap-4 mb-6">
        <button (click)="goBack()" class="btn-ghost"><i class="fas fa-arrow-left mr-2"></i>Back</button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Sprint Report</h1>
      </div>

      <div *ngIf="report" class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="card card-body text-center">
            <div class="text-3xl font-bold text-primary">{{ report.completedPoints }}</div>
            <div class="text-sm text-gray-500 mt-1">Points Completed</div>
            <div class="text-xs text-gray-400">of {{ report.committedPoints }} committed</div>
          </div>
          <div class="card card-body text-center">
            <div class="text-3xl font-bold text-green-600">{{ report.completedTasks }}</div>
            <div class="text-sm text-gray-500 mt-1">Tasks Completed</div>
            <div class="text-xs text-gray-400">of {{ report.totalTasks }} total</div>
          </div>
          <div class="card card-body text-center">
            <div class="text-3xl font-bold text-blue-600">{{ report.velocity | number:'1.0-1' }}</div>
            <div class="text-sm text-gray-500 mt-1">Velocity</div>
            <div class="text-xs text-gray-400">story points</div>
          </div>
          <div class="card card-body text-center">
            <div class="text-3xl font-bold" [ngClass]="completionRate >= 80 ? 'text-green-600' : completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'">
              {{ completionRate | number:'1.0-0' }}%
            </div>
            <div class="text-sm text-gray-500 mt-1">Completion Rate</div>
          </div>
        </div>

        <!-- Burndown Chart (Simple Table View) -->
        <div class="card">
          <div class="card-header"><h3 class="font-semibold text-gray-900">Burndown Data</h3></div>
          <div class="card-body overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-500 border-b">
                  <th class="pb-2 pr-4">Date</th>
                  <th class="pb-2 pr-4">Ideal</th>
                  <th class="pb-2">Actual</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let point of report.burndownData" class="border-b border-gray-50">
                  <td class="py-2 pr-4 font-mono text-xs">{{ point['date'] }}</td>
                  <td class="py-2 pr-4">{{ point['ideal'] | number:'1.0-1' }}</td>
                  <td class="py-2" [ngClass]="point['actual'] !== undefined && point['actual'] > point['ideal'] ? 'text-red-600' : 'text-green-600'">
                    {{ point['actual'] !== undefined ? (point['actual'] | number:'1.0-1') : '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tasks by Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card">
            <div class="card-header"><h3 class="font-semibold text-gray-900">Tasks by Status</h3></div>
            <div class="card-body space-y-3">
              <div *ngFor="let entry of statusEntries" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ entry[0] }}</span>
                <div class="flex items-center gap-2">
                  <div class="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full" [ngClass]="getStatusColor(entry[0])"
                         [style.width.%]="report.totalTasks > 0 ? (entry[1] / report.totalTasks * 100) : 0"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-700 w-8 text-right">{{ entry[1] }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3 class="font-semibold text-gray-900">Tasks by Priority</h3></div>
            <div class="card-body space-y-3">
              <div *ngFor="let entry of priorityEntries" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ entry[0] }}</span>
                <div class="flex items-center gap-2">
                  <div class="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full" [ngClass]="getPriorityColor(entry[0])"
                         [style.width.%]="report.totalTasks > 0 ? (entry[1] / report.totalTasks * 100) : 0"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-700 w-8 text-right">{{ entry[1] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!report && !loading" class="text-center py-12 text-gray-500">No report data available.</div>
      <div *ngIf="loading" class="text-center py-12"><div class="skeleton w-48 h-8 mx-auto mb-4"></div></div>
    </div>
  `
})
export class SprintReportComponent implements OnInit {
  report: SprintReport | null = null;
  loading = true;
  completionRate = 0;
  statusEntries: [string, number][] = [];
  priorityEntries: [string, number][] = [];

  constructor(private route: ActivatedRoute, private reportService: ReportService) {}

  ngOnInit(): void {
    const sprintId = Number(this.route.snapshot.paramMap.get('sprintId'));
    if (sprintId) {
      this.reportService.getSprintReport(sprintId).subscribe(res => {
        this.report = res.data;
        if (this.report) {
          this.completionRate = this.report.totalTasks > 0
            ? (this.report.completedTasks / this.report.totalTasks * 100) : 0;
          this.statusEntries = Object.entries(this.report.tasksByStatus || {});
          this.priorityEntries = Object.entries(this.report.tasksByPriority || {});
        }
        this.loading = false;
      });
    }
  }

  goBack(): void {
    window.history.back();
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'TODO': 'bg-gray-400', 'IN_PROGRESS': 'bg-blue-500', 'IN_REVIEW': 'bg-yellow-500', 'DONE': 'bg-green-500'
    };
    return colors[status] || 'bg-gray-400';
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'LOW': 'bg-gray-400', 'MEDIUM': 'bg-blue-500', 'HIGH': 'bg-orange-500', 'CRITICAL': 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-400';
  }
}
