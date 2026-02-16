import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { SprintService } from '../../../core/services/sprint.service';
import { TaskService } from '../../../core/services/task.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Sprint, SprintRequest, SprintStatus } from '../../../core/models/sprint.model';
import { Task, TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sprint-backlog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule, StatusBadgeComponent, PriorityBadgeComponent, AvatarComponent, LoadingSpinnerComponent, ConfirmDialogComponent],
  template: `
    <div class="p-6" *ngIf="!loading">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Backlog</h1>
          <p class="text-gray-500 text-sm mt-1">Plan and manage sprints for your project</p>
        </div>
        <button (click)="showCreateSprint = true" class="btn btn-primary">
          <i class="fas fa-plus mr-2"></i>Create Sprint
        </button>
      </div>

      <!-- Sprints -->
      <div class="space-y-4">
        <div *ngFor="let sprint of sprints" class="card">
          <div class="p-4">
            <!-- Sprint Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <button (click)="sprint._expanded = !sprint._expanded" class="text-gray-400 hover:text-gray-600">
                  <i class="fas" [ngClass]="sprint._expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                </button>
                <h3 class="font-semibold text-gray-900">{{ sprint.name }}</h3>
                <span class="px-2 py-0.5 text-xs rounded-full font-medium"
                      [ngClass]="{
                        'bg-gray-100 text-gray-600': sprint.status === 'PLANNING',
                        'bg-blue-100 text-blue-700': sprint.status === 'ACTIVE',
                        'bg-green-100 text-green-700': sprint.status === 'COMPLETED'
                      }">
                  {{ sprint.status }}
                </span>
                <span class="text-sm text-gray-500" *ngIf="sprint.startDate">
                  {{ sprint.startDate | date:'MMM d' }} - {{ sprint.endDate | date:'MMM d' }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">{{ sprint.completedTasks }}/{{ sprint.totalTasks }} tasks</span>
                <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-primary rounded-full transition-all" [style.width.%]="sprint.progressPercentage"></div>
                </div>
                <div class="relative" *ngIf="sprint.status !== 'COMPLETED'">
                  <button (click)="toggleSprintMenu(sprint)" class="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <i class="fas fa-ellipsis-h"></i>
                  </button>
                  <div *ngIf="sprint._menuOpen" class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-20">
                    <button *ngIf="sprint.status === 'PLANNING'" (click)="startSprint(sprint); sprint._menuOpen = false"
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-blue-600">
                      <i class="fas fa-play mr-2"></i>Start Sprint
                    </button>
                    <button *ngIf="sprint.status === 'ACTIVE'" (click)="completeSprint(sprint); sprint._menuOpen = false"
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-green-600">
                      <i class="fas fa-check mr-2"></i>Complete Sprint
                    </button>
                    <button (click)="editSprint(sprint); sprint._menuOpen = false"
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                      <i class="fas fa-edit mr-2"></i>Edit Sprint
                    </button>
                    <button (click)="confirmDeleteSprint = sprint; sprint._menuOpen = false"
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">
                      <i class="fas fa-trash mr-2"></i>Delete Sprint
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sprint Goal -->
            <p *ngIf="sprint.goal && sprint._expanded" class="text-sm text-gray-500 ml-8 mb-3">{{ sprint.goal }}</p>

            <!-- Sprint Tasks -->
            <div *ngIf="sprint._expanded" cdkDropList [cdkDropListData]="sprintTasksMap[sprint.id] || []"
                 [id]="'sprint-' + sprint.id"
                 [cdkDropListConnectedTo]="getConnectedLists(sprint.id)"
                 (cdkDropListDropped)="onDrop($event, sprint.id)"
                 class="ml-8 space-y-1 min-h-[40px] rounded-lg transition-colors">
              <div *ngFor="let task of sprintTasksMap[sprint.id] || []" cdkDrag
                   class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-move group">
                <i class="fas fa-grip-vertical text-gray-300 group-hover:text-gray-400"></i>
                <app-status-badge [status]="task.status" class="flex-shrink-0"></app-status-badge>
                <span class="text-xs font-mono text-gray-400">{{ task.taskKey }}</span>
                <a [routerLink]="['/tasks', task.id]" class="text-sm text-gray-800 hover:text-primary truncate flex-1">{{ task.title }}</a>
                <app-priority-badge [priority]="task.priority" class="flex-shrink-0"></app-priority-badge>
                <app-avatar *ngIf="task.assignee" [name]="task.assignee.fullName || ''" [size]="24" class="flex-shrink-0"></app-avatar>
              </div>
              <div *ngIf="!(sprintTasksMap[sprint.id]?.length)" class="text-center py-4 text-sm text-gray-400">
                Drag tasks here from the backlog
              </div>
            </div>
          </div>
        </div>

        <!-- Backlog Section -->
        <div class="card">
          <div class="p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <button (click)="backlogExpanded = !backlogExpanded" class="text-gray-400 hover:text-gray-600">
                  <i class="fas" [ngClass]="backlogExpanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                </button>
                <h3 class="font-semibold text-gray-900">Backlog</h3>
                <span class="text-sm text-gray-500">{{ backlogTasks.length }} tasks</span>
              </div>
            </div>

            <div *ngIf="backlogExpanded" cdkDropList [cdkDropListData]="backlogTasks"
                 id="backlog"
                 [cdkDropListConnectedTo]="getConnectedLists(-1)"
                 (cdkDropListDropped)="onDrop($event, -1)"
                 class="ml-8 space-y-1 min-h-[40px] rounded-lg transition-colors">
              <div *ngFor="let task of backlogTasks" cdkDrag
                   class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-move group">
                <i class="fas fa-grip-vertical text-gray-300 group-hover:text-gray-400"></i>
                <app-status-badge [status]="task.status" class="flex-shrink-0"></app-status-badge>
                <span class="text-xs font-mono text-gray-400">{{ task.taskKey }}</span>
                <a [routerLink]="['/tasks', task.id]" class="text-sm text-gray-800 hover:text-primary truncate flex-1">{{ task.title }}</a>
                <app-priority-badge [priority]="task.priority" class="flex-shrink-0"></app-priority-badge>
                <app-avatar *ngIf="task.assignee" [name]="task.assignee.fullName || ''" [size]="24" class="flex-shrink-0"></app-avatar>
              </div>
              <div *ngIf="backlogTasks.length === 0" class="text-center py-4 text-sm text-gray-400">
                No tasks in backlog
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Sprint Modal -->
      <div *ngIf="showCreateSprint" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <h2 class="text-lg font-semibold mb-4">{{ editingSprintId ? 'Edit Sprint' : 'Create Sprint' }}</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sprint Name</label>
              <input [(ngModel)]="sprintForm.name" class="form-input w-full" placeholder="Sprint 1">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Goal</label>
              <textarea [(ngModel)]="sprintForm.goal" class="form-input w-full" rows="2" placeholder="What should this sprint accomplish?"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" [(ngModel)]="sprintForm.startDate" class="form-input w-full">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" [(ngModel)]="sprintForm.endDate" class="form-input w-full">
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button (click)="cancelSprintForm()" class="btn btn-secondary">Cancel</button>
            <button (click)="saveSprint()" class="btn btn-primary">{{ editingSprintId ? 'Update' : 'Create' }}</button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <app-confirm-dialog *ngIf="confirmDeleteSprint"
        title="Delete Sprint"
        [message]="'Are you sure you want to delete sprint \\'' + confirmDeleteSprint.name + '\\'? Tasks will be moved to the backlog.'"
        type="danger"
        (confirmed)="deleteSprint(confirmDeleteSprint); confirmDeleteSprint = null"
        (cancelled)="confirmDeleteSprint = null">
      </app-confirm-dialog>
    </div>

    <app-loading-spinner *ngIf="loading"></app-loading-spinner>
  `
})
export class SprintBacklogComponent implements OnInit {
  projectId!: number;
  sprints: (Sprint & { _expanded?: boolean; _menuOpen?: boolean })[] = [];
  backlogTasks: Task[] = [];
  sprintTasksMap: Record<number, Task[]> = {};
  loading = true;
  backlogExpanded = true;

  showCreateSprint = false;
  editingSprintId: number | null = null;
  sprintForm: SprintRequest = { name: '', goal: '', projectId: 0 };
  confirmDeleteSprint: Sprint | null = null;

  constructor(
    private route: ActivatedRoute,
    private sprintService: SprintService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.sprintForm.projectId = this.projectId;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.sprintService.getProjectSprints(this.projectId).subscribe(res => {
      if (res.success) {
        this.sprints = res.data.map(s => ({ ...s, _expanded: s.status === 'ACTIVE' || s.status === 'PLANNING' }));
        this.sprints.forEach(sprint => {
          this.sprintService.getSprintTasks(sprint.id).subscribe(taskRes => {
            if (taskRes.success) {
              this.sprintTasksMap[sprint.id] = taskRes.data;
            }
          });
        });
      }
      this.sprintService.getBacklogTasks(this.projectId).subscribe(backlogRes => {
        if (backlogRes.success) {
          this.backlogTasks = backlogRes.data;
        }
        this.loading = false;
      });
    });
  }

  getConnectedLists(currentId: number): string[] {
    const lists = this.sprints.map(s => 'sprint-' + s.id);
    lists.push('backlog');
    return lists.filter(l => l !== (currentId === -1 ? 'backlog' : 'sprint-' + currentId));
  }

  onDrop(event: CdkDragDrop<Task[]>, targetId: number): void {
    if (event.previousContainer === event.container) return;

    const task = event.previousContainer.data[event.previousIndex];
    const previousListId = event.previousContainer.id;

    // Remove from source
    event.previousContainer.data.splice(event.previousIndex, 1);
    // Add to target
    event.container.data.splice(event.currentIndex, 0, task);

    if (targetId === -1) {
      // Moving to backlog
      const prevSprintId = Number(previousListId.replace('sprint-', ''));
      this.sprintService.removeTaskFromSprint(prevSprintId, task.id).subscribe();
    } else {
      // Moving to a sprint
      this.sprintService.addTaskToSprint(targetId, task.id).subscribe();
    }
  }

  toggleSprintMenu(sprint: any): void {
    this.sprints.forEach(s => (s as any)._menuOpen = false);
    sprint._menuOpen = !sprint._menuOpen;
  }

  startSprint(sprint: Sprint): void {
    this.sprintService.startSprint(sprint.id).subscribe(res => {
      if (res.success) {
        this.notificationService.success('Sprint started');
        this.loadData();
      }
    });
  }

  completeSprint(sprint: Sprint): void {
    this.sprintService.completeSprint(sprint.id).subscribe(res => {
      if (res.success) {
        this.notificationService.success('Sprint completed');
        this.loadData();
      }
    });
  }

  editSprint(sprint: Sprint): void {
    this.editingSprintId = sprint.id;
    this.sprintForm = {
      name: sprint.name,
      goal: sprint.goal,
      projectId: this.projectId,
      startDate: sprint.startDate,
      endDate: sprint.endDate
    };
    this.showCreateSprint = true;
  }

  saveSprint(): void {
    if (!this.sprintForm.name) return;

    if (this.editingSprintId) {
      this.sprintService.updateSprint(this.editingSprintId, this.sprintForm).subscribe(res => {
        if (res.success) {
          this.notificationService.success('Sprint updated');
          this.cancelSprintForm();
          this.loadData();
        }
      });
    } else {
      this.sprintService.createSprint(this.sprintForm).subscribe(res => {
        if (res.success) {
          this.notificationService.success('Sprint created');
          this.cancelSprintForm();
          this.loadData();
        }
      });
    }
  }

  deleteSprint(sprint: Sprint): void {
    this.sprintService.deleteSprint(sprint.id).subscribe(res => {
      if (res.success) {
        this.notificationService.success('Sprint deleted');
        this.loadData();
      }
    });
  }

  cancelSprintForm(): void {
    this.showCreateSprint = false;
    this.editingSprintId = null;
    this.sprintForm = { name: '', goal: '', projectId: this.projectId };
  }
}
