import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Project, ProjectStatus, ProjectRequest } from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="visible"
         class="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <!-- Dark Overlay -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="onClose()"></div>

      <!-- Modal Card -->
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              {{ isEditMode ? 'Edit Project' : 'New Project' }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              {{ isEditMode ? 'Update project details' : 'Create a new project to organize your work' }}
            </p>
          </div>
          <button (click)="onClose()"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-5">
          <!-- Project Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Project Name <span class="text-red-500">*</span>
            </label>
            <input type="text" formControlName="name"
                   class="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-1 outline-none transition-all"
                   [ngClass]="form.get('name')?.invalid && form.get('name')?.touched
                     ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                     : 'border-gray-300 focus:border-primary focus:ring-primary'"
                   placeholder="e.g. Website Redesign">
            <p *ngIf="form.get('name')?.hasError('required') && form.get('name')?.touched"
               class="mt-1 text-xs text-red-500">
              Project name is required
            </p>
            <p *ngIf="form.get('name')?.hasError('minlength') && form.get('name')?.touched"
               class="mt-1 text-xs text-red-500">
              Name must be at least 2 characters
            </p>
          </div>

          <!-- Project Key -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Project Key <span class="text-red-500">*</span>
            </label>
            <input type="text" formControlName="key"
                   class="w-full px-4 py-2.5 border rounded-lg text-sm uppercase focus:ring-1 outline-none transition-all"
                   [ngClass]="form.get('key')?.invalid && form.get('key')?.touched
                     ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                     : 'border-gray-300 focus:border-primary focus:ring-primary'"
                   placeholder="e.g. WRD"
                   maxlength="10">
            <p class="mt-1 text-xs text-gray-400">
              A short unique identifier used as task prefix (e.g., WRD-001). 2-10 uppercase characters.
            </p>
            <p *ngIf="form.get('key')?.hasError('required') && form.get('key')?.touched"
               class="mt-1 text-xs text-red-500">
              Project key is required
            </p>
            <p *ngIf="form.get('key')?.hasError('minlength') && form.get('key')?.touched"
               class="mt-1 text-xs text-red-500">
              Key must be at least 2 characters
            </p>
            <p *ngIf="form.get('key')?.hasError('pattern') && form.get('key')?.touched"
               class="mt-1 text-xs text-red-500">
              Key must contain only uppercase letters and numbers
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea formControlName="description" rows="3"
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                      placeholder="Describe the purpose and goals of this project..."></textarea>
          </div>

          <!-- Status (only in edit mode) -->
          <div *ngIf="isEditMode">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select formControlName="status"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white appearance-none cursor-pointer">
              <option *ngFor="let s of projectStatuses" [value]="s.value">
                {{ s.label }}
              </option>
            </select>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <input type="date" formControlName="startDate"
                     class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
              <input type="date" formControlName="endDate"
                     class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                     [class.border-red-500]="dateError">
              <p *ngIf="dateError" class="mt-1 text-xs text-red-500">
                End date must be after start date
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" (click)="onClose()"
                    class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit"
                    [disabled]="form.invalid || saving || dateError"
                    class="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-sm">
              <span *ngIf="saving"
                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <i *ngIf="!saving" class="fas" [ngClass]="isEditMode ? 'fa-save' : 'fa-plus'"></i>
              {{ saving ? 'Saving...' : (isEditMode ? 'Update Project' : 'Create Project') }}
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

  projectStatuses = [
    { value: ProjectStatus.ACTIVE, label: 'Active' },
    { value: ProjectStatus.COMPLETED, label: 'Completed' },
    { value: ProjectStatus.ARCHIVED, label: 'Archived' }
  ];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private notificationService: NotificationService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      key: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10), Validators.pattern(/^[A-Z0-9]+$/)]],
      description: [''],
      status: [ProjectStatus.ACTIVE],
      startDate: [''],
      endDate: ['']
    });

    // Auto-uppercase the key field on value changes
    this.form.get('key')?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        this.form.get('key')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });
  }

  get isEditMode(): boolean {
    return this.project !== null;
  }

  get dateError(): boolean {
    const start = this.form.get('startDate')?.value;
    const end = this.form.get('endDate')?.value;
    if (!start || !end) return false;
    return new Date(end) < new Date(start);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      if (this.project) {
        // Edit mode: pre-fill form
        this.form.patchValue({
          name: this.project.name,
          key: this.project.key,
          description: this.project.description || '',
          status: this.project.status,
          startDate: this.project.startDate ? this.formatDateForInput(this.project.startDate) : '',
          endDate: this.project.endDate ? this.formatDateForInput(this.project.endDate) : ''
        });
        this.form.get('key')?.disable();
      } else {
        // Create mode: reset form
        this.form.reset({
          name: '',
          key: '',
          description: '',
          status: ProjectStatus.ACTIVE,
          startDate: '',
          endDate: ''
        });
        this.form.get('key')?.enable();
      }
      this.form.markAsPristine();
      this.form.markAsUntouched();
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.dateError) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    // Get form value including disabled fields
    const formValue = this.form.getRawValue();

    const data: ProjectRequest = {
      name: formValue.name.trim(),
      key: formValue.key.trim().toUpperCase(),
      description: formValue.description?.trim() || '',
      status: this.isEditMode ? formValue.status : ProjectStatus.ACTIVE,
      startDate: formValue.startDate || '',
      endDate: formValue.endDate || ''
    };

    const operation = this.isEditMode
      ? this.projectService.updateProject(this.project!.id, data)
      : this.projectService.createProject(data);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(
            this.isEditMode ? 'Project updated successfully' : 'Project created successfully'
          );
          this.saving = false;
          this.saved.emit();
        }
      },
      error: (err) => {
        this.notificationService.error(
          err.error?.message || (this.isEditMode ? 'Failed to update project' : 'Failed to create project')
        );
        this.saving = false;
      }
    });
  }

  onClose(): void {
    this.closed.emit();
  }

  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toISOString().split('T')[0];
  }
}
