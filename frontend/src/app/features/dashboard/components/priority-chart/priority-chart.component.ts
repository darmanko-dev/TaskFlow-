import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-priority-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
      <div class="relative h-64 flex items-center justify-center">
        <canvas baseChart
                *ngIf="chartData"
                [data]="chartData.data"
                [options]="chartData.options"
                [type]="chartData.type">
        </canvas>
        <div *ngIf="!chartData" class="flex items-center justify-center h-full text-gray-400">
          No data available
        </div>
      </div>
    </div>
  `
})
export class PriorityChartComponent implements OnChanges {
  @Input() tasksByPriority: Record<string, number> = {};

  chartData: ChartConfiguration<'doughnut'> | null = null;

  private readonly priorityColors: Record<string, string> = {
    'LOW': '#10B981',
    'MEDIUM': '#F59E0B',
    'HIGH': '#F97316',
    'CRITICAL': '#EF4444'
  };

  private readonly priorityLabels: Record<string, string> = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'CRITICAL': 'Critical'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasksByPriority'] && this.tasksByPriority) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    const keys = Object.keys(this.tasksByPriority);
    if (keys.length === 0) {
      this.chartData = null;
      return;
    }

    const labels = keys.map(k => this.priorityLabels[k] || k);
    const data = keys.map(k => this.tasksByPriority[k]);
    const colors = keys.map(k => this.priorityColors[k] || '#9CA3AF');

    this.chartData = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: '#FFFFFF',
            borderWidth: 3,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
              color: '#374151',
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F9FAFB',
            bodyColor: '#F9FAFB',
            cornerRadius: 8,
            padding: 12
          }
        }
      }
    };
  }
}
