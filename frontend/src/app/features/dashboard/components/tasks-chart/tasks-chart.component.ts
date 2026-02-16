import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-tasks-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
      <div class="relative h-64">
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
export class TasksChartComponent implements OnChanges {
  @Input() tasksByStatus: Record<string, number> = {};

  chartData: ChartConfiguration<'bar'> | null = null;

  private readonly statusColors: Record<string, string> = {
    'TODO': '#94A3B8',
    'IN_PROGRESS': '#3B82F6',
    'IN_REVIEW': '#8B5CF6',
    'DONE': '#10B981'
  };

  private readonly statusLabels: Record<string, string> = {
    'TODO': 'To Do',
    'IN_PROGRESS': 'In Progress',
    'IN_REVIEW': 'In Review',
    'DONE': 'Done'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasksByStatus'] && this.tasksByStatus) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    const keys = Object.keys(this.tasksByStatus);
    if (keys.length === 0) {
      this.chartData = null;
      return;
    }

    const labels = keys.map(k => this.statusLabels[k] || k.replace(/_/g, ' '));
    const data = keys.map(k => this.tasksByStatus[k]);
    const colors = keys.map(k => this.statusColors[k] || '#94A3B8');

    this.chartData = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Tasks',
            data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F9FAFB',
            bodyColor: '#F9FAFB',
            cornerRadius: 8,
            padding: 12
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6B7280',
              font: { size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#F3F4F6'
            },
            ticks: {
              color: '#6B7280',
              font: { size: 12 },
              stepSize: 1
            }
          }
        }
      }
    };
  }
}
