import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Project } from '../../../../core/models/project.model';

@Component({
  selector: 'app-project-progress',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>

      <div *ngIf="projects && projects.length > 0; else emptyState" class="space-y-5">
        <div *ngFor="let project of projects" class="group">
          <div class="flex items-center justify-between mb-2">
            <a [routerLink]="['/projects', project.id]"
               class="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors hover:underline">
              {{ project.name }}
            </a>
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-500">
                {{ project.completedTasks }}/{{ project.totalTasks }} tasks
              </span>
              <span class="text-xs font-semibold" [ngClass]="getPercentageColor(project.progressPercentage)">
                {{ project.progressPercentage }}%
              </span>
            </div>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500 ease-out"
                 [ngClass]="getBarColor(project.progressPercentage)"
                 [ngStyle]="{'width': project.progressPercentage + '%'}">
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="text-center py-8 text-gray-400">
          <i class="fas fa-project-diagram text-3xl mb-2"></i>
          <p class="text-sm">No projects found</p>
        </div>
      </ng-template>
    </div>
  `
})
export class ProjectProgressComponent {
  @Input() projects: Project[] = [];

  getBarColor(percentage: number): string {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getPercentageColor(percentage: number): string {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }
}
