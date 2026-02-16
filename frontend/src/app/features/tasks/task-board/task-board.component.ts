import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';

import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TaskCardComponent } from '../task-card/task-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface BoardColumn {
  id: string;
  status: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent, LoadingSpinnerComponent],
  template: `
    <!-- Loading State -->
    <app-loading-spinner *ngIf="loading" message="Loading board..." />

    <!-- Board -->
    <div *ngIf="!loading" class="flex gap-4 h-full overflow-x-auto pb-4">
      <div
        *ngFor="let column of columns"
        class="flex-1 min-w-[280px] max-w-[340px] flex flex-col bg-gray-50 rounded-xl">

        <!-- Column Color Stripe -->
        <div class="h-1.5 rounded-t-xl" [style.background-color]="column.color"></div>

        <!-- Column Header -->
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-gray-700">{{ column.label }}</h3>
            <span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                  [style.background-color]="column.color">
              {{ column.tasks.length }}
            </span>
          </div>
        </div>

        <!-- Drop List -->
        <div
          class="flex-1 px-3 pb-3 overflow-y-auto min-h-[200px] space-y-2"
          cdkDropList
          [id]="column.id"
          [cdkDropListData]="column.tasks"
          [cdkDropListConnectedTo]="columnIds"
          (cdkDropListDropped)="onDrop($event)">

          <!-- Draggable Task Cards -->
          <div
            *ngFor="let task of column.tasks"
            cdkDrag
            [cdkDragData]="task"
            class="cursor-grab active:cursor-grabbing">

            <!-- Drag Placeholder -->
            <div *cdkDragPlaceholder
                 class="rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 h-[100px]">
            </div>

            <app-task-card [task]="task" />
          </div>

          <!-- Empty Column State -->
          <div *ngIf="column.tasks.length === 0"
               class="flex flex-col items-center justify-center py-8 text-gray-400">
            <i class="fas fa-inbox text-2xl mb-2"></i>
            <p class="text-xs">No tasks</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="!loading && errorMessage" class="flex flex-col items-center justify-center py-16">
      <i class="fas fa-exclamation-circle text-3xl text-red-400 mb-3"></i>
      <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
      <button (click)="loadTasks()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
        <i class="fas fa-redo mr-2"></i>Retry
      </button>
    </div>
  `
})
export class TaskBoardComponent implements OnInit, OnChanges {
  @Input({ required: true }) projectId!: number;

  columns: BoardColumn[] = [];
  columnIds: string[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private taskService: TaskService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadTasks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && !changes['projectId'].firstChange) {
      this.loadTasks();
    }
  }

  private initializeColumns(): void {
    this.columns = [
      {
        id: 'col-todo',
        status: TaskStatus.TODO,
        label: 'To Do',
        color: '#94A3B8',
        tasks: []
      },
      {
        id: 'col-in-progress',
        status: TaskStatus.IN_PROGRESS,
        label: 'In Progress',
        color: '#3B82F6',
        tasks: []
      },
      {
        id: 'col-in-review',
        status: TaskStatus.IN_REVIEW,
        label: 'In Review',
        color: '#8B5CF6',
        tasks: []
      },
      {
        id: 'col-done',
        status: TaskStatus.DONE,
        label: 'Done',
        color: '#10B981',
        tasks: []
      }
    ];

    this.columnIds = this.columns.map(c => c.id);
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (response) => {
        if (response.success) {
          this.distributeTasks(response.data);
        } else {
          this.errorMessage = response.message || 'Failed to load tasks.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load tasks. Please try again.';
        this.loading = false;
      }
    });
  }

  private distributeTasks(tasks: Task[]): void {
    // Clear all columns
    this.columns.forEach(col => col.tasks = []);

    // Distribute tasks into columns by status
    tasks.forEach(task => {
      const column = this.columns.find(col => col.status === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Reorder within the same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move between columns
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Determine the new status from the target column
      const targetColumn = this.columns.find(col => col.id === event.container.id);
      if (targetColumn) {
        const movedTask = event.container.data[event.currentIndex];
        const previousStatus = movedTask.status;
        movedTask.status = targetColumn.status;

        // Update on the server
        this.taskService.updateTaskStatus(movedTask.id, targetColumn.status).subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.success(
                `Task moved to ${targetColumn.label}`
              );
            } else {
              // Revert on failure
              this.revertDrop(event, previousStatus);
              this.notificationService.error(response.message || 'Failed to update task status.');
            }
          },
          error: () => {
            this.revertDrop(event, previousStatus);
            this.notificationService.error('Failed to update task status.');
          }
        });
      }
    }
  }

  private revertDrop(event: CdkDragDrop<Task[]>, previousStatus: TaskStatus): void {
    // Move the task back
    transferArrayItem(
      event.container.data,
      event.previousContainer.data,
      event.currentIndex,
      event.previousIndex
    );

    // Restore status
    const task = event.previousContainer.data[event.previousIndex];
    if (task) {
      task.status = previousStatus;
    }
  }
}
