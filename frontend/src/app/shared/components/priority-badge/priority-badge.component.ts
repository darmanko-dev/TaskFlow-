import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          [ngClass]="badgeClass">
      <i class="fas text-[10px]" [ngClass]="iconClass"></i>
      {{ label }}
    </span>
  `
})
export class PriorityBadgeComponent {
  @Input() priority: string = 'MEDIUM';

  get badgeClass(): string {
    switch (this.priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'LOW': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  get iconClass(): string {
    switch (this.priority) {
      case 'CRITICAL': return 'fa-fire';
      case 'HIGH': return 'fa-arrow-up';
      case 'MEDIUM': return 'fa-minus';
      case 'LOW': return 'fa-arrow-down';
      default: return 'fa-minus';
    }
  }

  get label(): string {
    return this.priority?.replace('_', ' ') || 'MEDIUM';
  }
}
