import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutomationRuleService } from '../../../core/services/automation.service';
import { AutomationRule, AutomationRuleRequest } from '../../../core/models/automation.model';

@Component({
  selector: 'app-automation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Automation Rules</h3>
        <button (click)="showForm = true" class="btn-primary btn-sm"><i class="fas fa-plus mr-1"></i>Add Rule</button>
      </div>

      <div *ngIf="rules.length === 0" class="text-center py-8 text-gray-500">No automation rules yet.</div>

      <div *ngFor="let rule of rules" class="card p-4">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900">{{ rule.name }}</span>
              <span class="badge" [ngClass]="rule.enabled ? 'badge-success' : 'badge-secondary'">{{ rule.enabled ? 'Active' : 'Disabled' }}</span>
            </div>
            <p *ngIf="rule.description" class="text-sm text-gray-500 mt-1">{{ rule.description }}</p>
            <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span><i class="fas fa-bolt mr-1"></i>{{ rule.triggerType }}</span>
              <span><i class="fas fa-play mr-1"></i>{{ rule.actionType }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button (click)="toggleRule(rule)" class="btn-ghost btn-sm">
              <i class="fas" [ngClass]="rule.enabled ? 'fa-pause' : 'fa-play'"></i>
            </button>
            <button (click)="deleteRule(rule.id)" class="btn-ghost btn-sm text-red-500"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>

      <!-- Add Rule Modal -->
      <div *ngIf="showForm" class="modal-overlay" (click)="showForm = false">
        <div class="modal-content max-w-lg" (click)="$event.stopPropagation()">
          <div class="px-6 py-4 border-b"><h3 class="font-semibold">New Automation Rule</h3></div>
          <div class="p-6 space-y-4">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input [(ngModel)]="newRule.name" class="form-input" placeholder="Rule name">
            </div>
            <div class="form-group">
              <label class="form-label">Trigger</label>
              <select [(ngModel)]="newRule.triggerType" class="form-select">
                <option value="STATUS_CHANGED">Status Changed</option>
                <option value="TASK_CREATED">Task Created</option>
                <option value="TASK_ASSIGNED">Task Assigned</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Trigger Config (JSON)</label>
              <textarea [(ngModel)]="newRule.triggerConfig" class="form-textarea" rows="2" placeholder='{"toStatus":"DONE"}'></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Action</label>
              <select [(ngModel)]="newRule.actionType" class="form-select">
                <option value="CHANGE_STATUS">Change Status</option>
                <option value="ASSIGN_TO">Assign To</option>
                <option value="SEND_NOTIFICATION">Send Notification</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Action Config (JSON)</label>
              <textarea [(ngModel)]="newRule.actionConfig" class="form-textarea" rows="2" placeholder='{"status":"IN_REVIEW"}'></textarea>
            </div>
            <div class="flex justify-end gap-2">
              <button (click)="showForm = false" class="btn-outline">Cancel</button>
              <button (click)="createRule()" class="btn-primary">Create</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AutomationListComponent implements OnInit {
  @Input() projectId!: number;
  rules: AutomationRule[] = [];
  showForm = false;
  newRule: AutomationRuleRequest = {
    name: '', triggerType: 'STATUS_CHANGED', triggerConfig: '{}',
    actionType: 'CHANGE_STATUS', actionConfig: '{}', projectId: 0, enabled: true
  };

  constructor(private automationService: AutomationRuleService) {}

  ngOnInit(): void {
    this.newRule.projectId = this.projectId;
    this.loadRules();
  }

  loadRules(): void {
    this.automationService.getProjectRules(this.projectId).subscribe(res => {
      this.rules = res.data || [];
    });
  }

  createRule(): void {
    this.newRule.projectId = this.projectId;
    this.automationService.createRule(this.newRule).subscribe(() => {
      this.showForm = false;
      this.newRule = { name: '', triggerType: 'STATUS_CHANGED', triggerConfig: '{}', actionType: 'CHANGE_STATUS', actionConfig: '{}', projectId: this.projectId, enabled: true };
      this.loadRules();
    });
  }

  toggleRule(rule: AutomationRule): void {
    this.automationService.toggleRule(rule.id, !rule.enabled).subscribe(() => this.loadRules());
  }

  deleteRule(id: number): void {
    this.automationService.deleteRule(id).subscribe(() => this.loadRules());
  }
}
