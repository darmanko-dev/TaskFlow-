import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div class="relative">
        <div class="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div class="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <span *ngIf="message" class="ml-3 text-gray-500 text-sm">{{ message }}</span>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
  @Input() containerClass = 'py-12';
}
