import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          [ngClass]="badgeClass">
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status: string = 'TODO';

  get badgeClass(): string {
    switch (this.status) {
      case 'TODO': return 'bg-slate-100 text-slate-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'IN_REVIEW': return 'bg-purple-100 text-purple-700';
      case 'DONE': return 'bg-green-100 text-green-700';
      case 'ACTIVE': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  get dotClass(): string {
    switch (this.status) {
      case 'TODO': return 'bg-slate-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'IN_REVIEW': return 'bg-purple-500';
      case 'DONE': return 'bg-green-500';
      case 'ACTIVE': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'ARCHIVED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  }

  get label(): string {
    return this.status?.replace(/_/g, ' ') || 'TODO';
  }
}
