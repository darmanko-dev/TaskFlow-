import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-members',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent, ConfirmDialogComponent],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Team Members ({{ project.members?.length || 0 }})</h3>
        <div class="relative">
          <button (click)="showAddMember = !showAddMember"
                  class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
            <i class="fas fa-user-plus mr-2"></i>Add Member
          </button>
          <div *ngIf="showAddMember"
               class="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search users..."
                   class="w-full px-3 py-2 text-sm border-b border-gray-100 outline-none">
            <div class="max-h-48 overflow-y-auto">
              <button *ngFor="let user of filteredUsers"
                      (click)="addMember(user)"
                      class="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm text-left">
                <app-avatar [name]="user.fullName" [imageUrl]="user.avatar || ''" [size]="28"></app-avatar>
                <span>{{ user.fullName }}</span>
              </button>
              <p *ngIf="filteredUsers.length === 0" class="px-3 py-2 text-sm text-gray-400">No users found</p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div *ngFor="let member of project.members"
             class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div class="flex items-center gap-3">
            <app-avatar [name]="member.fullName" [imageUrl]="member.avatar || ''" [size]="40"></app-avatar>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ member.fullName }}</p>
              <p class="text-xs text-gray-500">{{ member.email }} &middot; {{ member.role?.replace('_', ' ') }}</p>
            </div>
          </div>
          <button *ngIf="member.id !== project.owner?.id"
                  (click)="confirmRemove(member)"
                  class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <i class="fas fa-user-minus text-sm"></i>
          </button>
        </div>
      </div>
    </div>

    <app-confirm-dialog
      [visible]="showConfirm"
      title="Remove Member"
      [message]="'Remove ' + (memberToRemove?.fullName || '') + ' from this project?'"
      confirmText="Remove"
      (confirmed)="removeMember()"
      (cancelled)="showConfirm = false">
    </app-confirm-dialog>
  `
})
export class ProjectMembersComponent implements OnInit {
  @Input() project!: Project;
  @Output() memberChanged = new EventEmitter<void>();

  allUsers: User[] = [];
  searchQuery = '';
  showAddMember = false;
  showConfirm = false;
  memberToRemove: User | null = null;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userService.getUsers(0, 50).subscribe(res => {
      this.allUsers = res.data?.content || [];
    });
  }

  get filteredUsers(): User[] {
    const memberIds = new Set(this.project.members?.map(m => m.id) || []);
    return this.allUsers
      .filter(u => !memberIds.has(u.id))
      .filter(u => !this.searchQuery || u.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  addMember(user: User): void {
    this.projectService.addMember(this.project.id, user.id).subscribe({
      next: () => {
        this.notificationService.success(`${user.fullName} added to project`);
        this.showAddMember = false;
        this.memberChanged.emit();
      },
      error: () => this.notificationService.error('Failed to add member')
    });
  }

  confirmRemove(member: User): void {
    this.memberToRemove = member;
    this.showConfirm = true;
  }

  removeMember(): void {
    if (!this.memberToRemove) return;
    this.projectService.removeMember(this.project.id, this.memberToRemove.id).subscribe({
      next: () => {
        this.notificationService.success('Member removed');
        this.showConfirm = false;
        this.memberChanged.emit();
      },
      error: () => this.notificationService.error('Failed to remove member')
    });
  }
}
