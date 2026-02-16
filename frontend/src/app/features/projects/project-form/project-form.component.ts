import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="visible" class="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div class="absolute inset-0 bg-black/50" (click)="onClose()"></div>
      <div class="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 animate-scaleIn">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ project ? 'Edit Project' : 'New Project' }}</h2>
          <button (click)="onClose()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Project Name *</label>
            <input type="text" formControlName="name"
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                   placeholder="My Awesome Project">
            <p *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="mt-1 text-xs text-red-500">Project name is required</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Project Key *</label>
            <input type="text" formControlName="key"
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase"
                   placeholder="MAP" [attr.disabled]="project ? '' : null">
            <p class="mt-1 text-xs text-gray-400">Used as task prefix (e.g., MAP-001)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea formControlName="description" rows="3"
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                      placeholder="Describe your project..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <input type="date" formControlName="startDate"
                     class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
              <input type="date" formControlName="endDate"
                     class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
            </div>
          </div>

          <div *ngIf="project">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select formControlName="status"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" (click)="onClose()"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="form.invalid || saving"
                    class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2">
              <span *ngIf="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ saving ? 'Saving...' : (project ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProjectFormComponent implements OnChanges {
  @Input() visible = false;
  @Input() project: Project | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private notificationService: NotificationService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      key: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      description: [''],
      status: ['ACTIVE'],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && this.project) {
      this.form.patchValue({
        name: this.project.name,
        key: this.project.key,
        description: this.project.description,
        status: this.project.status,
        startDate: this.project.startDate || '',
        endDate: this.project.endDate || ''
      });
    } else if (changes['visible'] && this.visible && !this.project) {
      this.form.reset({ status: 'ACTIVE' });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const data = this.form.value;

    const operation = this.project
      ? this.projectService.updateProject(this.project.id, data)
      : this.projectService.createProject(data);

    operation.subscribe({
      next: () => {
        this.notificationService.success(this.project ? 'Project updated' : 'Project created');
        this.saving = false;
        this.saved.emit();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to save project');
        this.saving = false;
      }
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}
