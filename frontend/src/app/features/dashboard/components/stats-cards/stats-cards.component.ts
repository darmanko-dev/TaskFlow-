import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardStats } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Projects -->
      <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Projects</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats?.totalProjects ?? 0 }}</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <i class="fas fa-folder text-xl text-blue-500"></i>
          </div>
        </div>
      </div>

      <!-- Total Tasks -->
      <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Tasks</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats?.totalTasks ?? 0 }}</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
            <i class="fas fa-tasks text-xl text-purple-500"></i>
          </div>
        </div>
      </div>

      <!-- Completed Tasks -->
      <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Completed</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats?.completedTasks ?? 0 }}</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
            <i class="fas fa-check-circle text-xl text-green-500"></i>
          </div>
        </div>
      </div>

      <!-- Overdue Tasks -->
      <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Overdue</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats?.overdueTasks ?? 0 }}</p>
          </div>
          <div class="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
            <i class="fas fa-exclamation-triangle text-xl text-red-500"></i>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatsCardsComponent {
  @Input() stats: DashboardStats | null = null;
}
