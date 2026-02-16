import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div class="absolute inset-0 bg-black/50" (click)="onCancel()"></div>
      <div class="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scaleIn">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center"
               [class]="type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'">
            <i class="fas" [class]="type === 'danger' ? 'fa-trash-alt text-red-600' : 'fa-exclamation-triangle text-yellow-600'"></i>
          </div>
          <h3 class="ml-3 text-lg font-semibold text-gray-900">{{ title }}</h3>
        </div>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button (click)="onCancel()"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button (click)="onConfirm()"
                  class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  [class]="type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() type: 'danger' | 'warning' = 'danger';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
