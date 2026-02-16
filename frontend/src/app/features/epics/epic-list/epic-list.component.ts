import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EpicService } from '../../../core/services/epic.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Epic, EpicRequest } from '../../../core/models/epic.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-epic-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent, ConfirmDialogComponent],
  template: `
    <div class="p-6" *ngIf="!loading">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Epics</h1>
          <p class="text-gray-500 text-sm mt-1">Group related tasks into larger initiatives</p>
        </div>
        <button (click)="showForm = true" class="btn btn-primary">
          <i class="fas fa-plus mr-2"></i>Create Epic
        </button>
      </div>

      <!-- Epic Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let epic of epics" class="card hover:shadow-md transition-shadow cursor-pointer">
          <div class="p-4">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" [style.backgroundColor]="epic.color"></div>
                <h3 class="font-semibold text-gray-900">{{ epic.name }}</h3>
              </div>
              <div class="flex items-center gap-1">
                <button (click)="editEpic(epic); $event.stopPropagation()" class="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <i class="fas fa-edit text-xs"></i>
                </button>
                <button (click)="confirmDelete = epic; $event.stopPropagation()" class="p-1 text-gray-400 hover:text-red-500 rounded">
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>

            <p *ngIf="epic.description" class="text-sm text-gray-500 mb-3 line-clamp-2">{{ epic.description }}</p>

            <!-- Progress -->
            <div class="mt-3">
              <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{{ epic.completedTasks }}/{{ epic.totalTasks }} tasks done</span>
                <span>{{ epic.progressPercentage | number:'1.0-0' }}%</span>
              </div>
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all" [style.backgroundColor]="epic.color" [style.width.%]="epic.progressPercentage"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="epics.length === 0" class="col-span-full text-center py-12">
          <i class="fas fa-layer-group text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">No epics yet. Create one to organize your tasks.</p>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <h2 class="text-lg font-semibold mb-4">{{ editingId ? 'Edit Epic' : 'Create Epic' }}</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input [(ngModel)]="formData.name" class="form-input w-full" placeholder="Epic name">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea [(ngModel)]="formData.description" class="form-input w-full" rows="3" placeholder="Describe this epic"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div class="flex gap-2">
                <button *ngFor="let c of colors" (click)="formData.color = c"
                        class="w-8 h-8 rounded-full border-2 transition-all"
                        [style.backgroundColor]="c"
                        [class.border-gray-900]="formData.color === c"
                        [class.border-transparent]="formData.color !== c"
                        [class.scale-110]="formData.color === c">
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button (click)="cancelForm()" class="btn btn-secondary">Cancel</button>
            <button (click)="saveEpic()" class="btn btn-primary">{{ editingId ? 'Update' : 'Create' }}</button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <app-confirm-dialog *ngIf="confirmDelete"
        title="Delete Epic"
        [message]="'Are you sure you want to delete epic \\'' + confirmDelete.name + '\\'? Tasks will be unlinked but not deleted.'"
        type="danger"
        (confirmed)="deleteEpic(confirmDelete); confirmDelete = null"
        (cancelled)="confirmDelete = null">
      </app-confirm-dialog>
    </div>

    <app-loading-spinner *ngIf="loading"></app-loading-spinner>
  `
})
export class EpicListComponent implements OnInit {
  projectId!: number;
  epics: Epic[] = [];
  loading = true;

  showForm = false;
  editingId: number | null = null;
  formData: EpicRequest = { name: '', projectId: 0 };
  confirmDelete: Epic | null = null;

  colors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4'];

  constructor(
    private route: ActivatedRoute,
    private epicService: EpicService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.formData.projectId = this.projectId;
    this.loadEpics();
  }

  loadEpics(): void {
    this.loading = true;
    this.epicService.getProjectEpics(this.projectId).subscribe(res => {
      if (res.success) {
        this.epics = res.data;
      }
      this.loading = false;
    });
  }

  editEpic(epic: Epic): void {
    this.editingId = epic.id;
    this.formData = { name: epic.name, description: epic.description, color: epic.color, projectId: this.projectId };
    this.showForm = true;
  }

  saveEpic(): void {
    if (!this.formData.name) return;

    if (this.editingId) {
      this.epicService.updateEpic(this.editingId, this.formData).subscribe(res => {
        if (res.success) {
          this.notificationService.showSuccess('Epic updated');
          this.cancelForm();
          this.loadEpics();
        }
      });
    } else {
      this.epicService.createEpic(this.formData).subscribe(res => {
        if (res.success) {
          this.notificationService.showSuccess('Epic created');
          this.cancelForm();
          this.loadEpics();
        }
      });
    }
  }

  deleteEpic(epic: Epic): void {
    this.epicService.deleteEpic(epic.id).subscribe(res => {
      if (res.success) {
        this.notificationService.showSuccess('Epic deleted');
        this.loadEpics();
      }
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.formData = { name: '', projectId: this.projectId };
  }
}
