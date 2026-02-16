import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskLinkService } from '../../../core/services/task-link.service';
import { TaskLink, TaskLinkRequest, LinkType } from '../../../core/models/task-link.model';

@Component({
  selector: 'app-task-link-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-gray-700">Linked Tasks</h4>
        <button (click)="showForm = !showForm" class="text-xs text-primary hover:text-primary-dark">
          <i class="fas fa-link mr-1"></i>Link
        </button>
      </div>

      <div *ngFor="let link of links" class="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{{ formatType(link.linkType) }}</span>
          <a [routerLink]="['/tasks', link.sourceTaskId === taskId ? link.targetTaskId : link.sourceTaskId]"
             class="text-primary hover:text-primary-dark font-mono text-xs">
            {{ link.sourceTaskId === taskId ? link.targetTaskKey : link.sourceTaskKey }}
          </a>
          <span class="text-gray-500 text-xs truncate max-w-[150px]">
            {{ link.sourceTaskId === taskId ? link.targetTaskTitle : link.sourceTaskTitle }}
          </span>
        </div>
        <button (click)="deleteLink(link.id)" class="text-gray-400 hover:text-red-500 text-xs"><i class="fas fa-times"></i></button>
      </div>

      <div *ngIf="links.length === 0" class="text-xs text-gray-400 py-2">No linked tasks</div>

      <div *ngIf="showForm" class="p-3 bg-gray-50 rounded-lg space-y-2">
        <select [(ngModel)]="newLink.linkType" class="form-select text-sm">
          <option value="BLOCKS">Blocks</option>
          <option value="IS_BLOCKED_BY">Is blocked by</option>
          <option value="DUPLICATES">Duplicates</option>
          <option value="IS_DUPLICATED_BY">Is duplicated by</option>
          <option value="RELATES_TO">Relates to</option>
        </select>
        <input [(ngModel)]="targetTaskId" type="number" class="form-input text-sm" placeholder="Target task ID">
        <div class="flex gap-2">
          <button (click)="createLink()" class="btn-primary btn-sm">Link</button>
          <button (click)="showForm = false" class="btn-ghost btn-sm">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class TaskLinkPanelComponent implements OnInit {
  @Input() taskId!: number;

  links: TaskLink[] = [];
  showForm = false;
  targetTaskId: number = 0;
  newLink: TaskLinkRequest = { sourceTaskId: 0, targetTaskId: 0, linkType: LinkType.BLOCKS };

  constructor(private taskLinkService: TaskLinkService) {}

  ngOnInit(): void {
    this.loadLinks();
  }

  loadLinks(): void {
    this.taskLinkService.getTaskLinks(this.taskId).subscribe(res => {
      this.links = res.data || [];
    });
  }

  createLink(): void {
    this.newLink.sourceTaskId = this.taskId;
    this.newLink.targetTaskId = this.targetTaskId;
    this.taskLinkService.createLink(this.newLink).subscribe(() => {
      this.showForm = false;
      this.targetTaskId = 0;
      this.loadLinks();
    });
  }

  deleteLink(id: number): void {
    this.taskLinkService.deleteLink(id).subscribe(() => this.loadLinks());
  }

  formatType(type: string): string {
    return type.replace(/_/g, ' ').toLowerCase();
  }
}
