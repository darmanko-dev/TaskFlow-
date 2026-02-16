import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <i class="fas text-3xl text-gray-400" [ngClass]="icon"></i>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-gray-500 text-sm text-center max-w-sm mb-6">{{ message }}</p>
      <button *ngIf="actionText" (click)="action.emit()"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
        <i class="fas fa-plus mr-2"></i>{{ actionText }}
      </button>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'fa-inbox';
  @Input() title = 'Nothing here yet';
  @Input() message = 'Get started by creating your first item.';
  @Input() actionText = '';
  @Output() action = new EventEmitter<void>();
}
