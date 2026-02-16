import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabelService } from '../../../core/services/label.service';
import { Label, LabelRequest } from '../../../core/models/label.model';

@Component({
  selector: 'app-label-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Labels</h4>
        <button (click)="showForm = !showForm" class="text-xs text-primary hover:text-primary-dark">
          <i class="fas fa-plus mr-1"></i>Add
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <span *ngFor="let label of labels"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white cursor-pointer"
              [style.backgroundColor]="label.color"
              (click)="onLabelClick(label)">
          {{ label.name }}
          <span class="text-white/70 text-[10px]">({{ label.taskCount }})</span>
        </span>
        <span *ngIf="labels.length === 0" class="text-xs text-gray-400">No labels</span>
      </div>

      <div *ngIf="showForm" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
        <input [(ngModel)]="newLabel.name" class="form-input text-sm" placeholder="Label name">
        <div class="flex items-center gap-2">
          <input type="color" [(ngModel)]="newLabel.color" class="w-8 h-8 rounded border-0 cursor-pointer">
          <button (click)="createLabel()" class="btn-primary btn-sm">Save</button>
          <button (click)="showForm = false" class="btn-ghost btn-sm">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class LabelManagerComponent implements OnInit {
  @Input() projectId!: number;
  @Output() labelSelected = new EventEmitter<Label>();

  labels: Label[] = [];
  showForm = false;
  newLabel: LabelRequest = { name: '', color: '#3B82F6', projectId: 0 };

  constructor(private labelService: LabelService) {}

  ngOnInit(): void {
    this.newLabel.projectId = this.projectId;
    this.loadLabels();
  }

  loadLabels(): void {
    this.labelService.getProjectLabels(this.projectId).subscribe(res => {
      this.labels = res.data || [];
    });
  }

  createLabel(): void {
    this.newLabel.projectId = this.projectId;
    this.labelService.createLabel(this.newLabel).subscribe(() => {
      this.showForm = false;
      this.newLabel = { name: '', color: '#3B82F6', projectId: this.projectId };
      this.loadLabels();
    });
  }

  onLabelClick(label: Label): void {
    this.labelSelected.emit(label);
  }
}
