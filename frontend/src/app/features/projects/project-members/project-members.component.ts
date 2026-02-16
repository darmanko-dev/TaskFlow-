import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';

@Component({
  selector: 'app-project-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvatarComponent,
    ConfirmDialogComponent,
    ClickOutsideDirective
  ],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            Team Members
          </h3>
          <p class="mt-0.5 text-sm text-gray-500">
            {{ project.members?.length || 0 }} {{ (project.members?.length || 0) === 1 ? 'member' : 'members' }} in this project
          </p>
        </div>
        <div class="relative" appClickOutside (appClickOutside)="showAddDropdown = false">
          <button (click)="toggleAddDropdown()"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm">
            <i class="fas fa-user-plus text-xs"></i>
            Add Member
          </button>

          <!-- Add Member Dropdown -->
          <div *ngIf="showAddDropdown"
               class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden animate-scaleIn">
            <!-- Search Input -->
            <div class="p-3 border-b border-gray-100">
              <div class="relative">
                <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input type="text"
                       [(ngModel)]="searchQuery"
                       placeholder="Search users by name or email..."
                       class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                       (input)="onSearchChange()">
              </div>
            </div>

            <!-- User List -->
            <div class="max-h-64 overflow-y-auto">
              <div *ngIf="filteredUsers.length === 0" class="px-4 py-6 text-center">
                <i class="fas fa-user-slash text-gray-300 text-2xl mb-2"></i>
                <p class="text-sm text-gray-400">
                  {{ searchQuery ? 'No matching users found' : 'All users are already members' }}
                </p>
              </div>

              <button *ngFor="let user of filteredUsers"
                      (click)="addMember(user)"
                      [disabled]="addingUserId === user.id"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0 disabled:opacity-50">
                <app-avatar [name]="user.fullName"
                            [imageUrl]="user.avatar || ''"
                            [size]="36">
                </app-avatar>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ user.fullName }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
                </div>
                <div class="flex-shrink-0">
                  <span *ngIf="addingUserId !== user.id"
                        class="text-xs text-primary font-medium px-2 py-1 bg-primary/5 rounded-md">
                    <i class="fas fa-plus mr-1"></i>Add
                  </span>
                  <span *ngIf="addingUserId === user.id"
                        class="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block"></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Members List -->
      <div class="divide-y divide-gray-100">
        <!-- Owner indicator row -->
        <div *ngFor="let member of project.members; let i = index"
             class="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors group">
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="relative">
              <app-avatar [name]="member.fullName"
                          [imageUrl]="member.avatar || ''"
                          [size]="44">
              </app-avatar>
              <div *ngIf="isOwner(member)"
                   class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center"
                   title="Project Owner">
                <i class="fas fa-crown text-white text-[6px]"></i>
              </div>
            </div>

            <!-- Info -->
            <div>
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-gray-900">{{ member.fullName }}</p>
                <span *ngIf="isOwner(member)"
                      class="text-[10px] font-semibold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded">
                  OWNER
                </span>
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs text-gray-500">{{ member.email }}</span>
                <span class="text-gray-300">&middot;</span>
                <span class="text-xs font-medium px-1.5 py-0.5 rounded"
                      [ngClass]="getRoleBadgeClass(member.role)">
                  {{ formatRole(member.role) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400 hidden sm:inline">
              Joined {{ member.createdAt | date:'MMM d, y' }}
            </span>
            <button *ngIf="!isOwner(member)"
                    (click)="confirmRemove(member)"
                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remove member">
              <i class="fas fa-user-minus text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state for no members -->
      <div *ngIf="!project.members || project.members.length === 0"
           class="flex flex-col items-center justify-center py-12 px-4">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fas fa-users text-xl text-gray-400"></i>
        </div>
        <h4 class="text-sm font-semibold text-gray-900 mb-1">No team members</h4>
        <p class="text-xs text-gray-500 text-center max-w-xs">
          Add team members to collaborate on this project.
        </p>
      </div>
    </div>

    <!-- Confirm Remove Dialog -->
    <app-confirm-dialog
      [visible]="showRemoveDialog"
      title="Remove Member"
      [message]="'Are you sure you want to remove ' + (memberToRemove?.fullName || '') + ' from this project? They will lose access to all project tasks and data.'"
      confirmText="Remove Member"
      type="danger"
      (confirmed)="removeMember()"
      (cancelled)="cancelRemove()">
    </app-confirm-dialog>
  `
})
export class ProjectMembersComponent implements OnInit, OnDestroy {
  @Input() project!: Project;
  @Output() memberChanged = new EventEmitter<void>();

  allUsers: User[] = [];
  searchQuery = '';
  showAddDropdown = false;
  addingUserId: number | null = null;

  showRemoveDialog = false;
  memberToRemove: User | null = null;
  removingMember = false;

  private destroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.userService.getUsers(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.allUsers = response.data.content;
          }
        },
        error: () => {
          this.notificationService.error('Failed to load users');
        }
      });
  }

  get filteredUsers(): User[] {
    const memberIds = new Set(this.project.members?.map(m => m.id) || []);
    return this.allUsers
      .filter(u => !memberIds.has(u.id))
      .filter(u => {
        if (!this.searchQuery.trim()) return true;
        const query = this.searchQuery.toLowerCase();
        return u.fullName.toLowerCase().includes(query) ||
               u.email.toLowerCase().includes(query);
      });
  }

  toggleAddDropdown(): void {
    this.showAddDropdown = !this.showAddDropdown;
    if (this.showAddDropdown) {
      this.searchQuery = '';
    }
  }

  onSearchChange(): void {
    // Filtering is handled by the getter
  }

  addMember(user: User): void {
    this.addingUserId = user.id;

    this.projectService.addMember(this.project.id, user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success(`${user.fullName} has been added to the project`);
            this.showAddDropdown = false;
            this.searchQuery = '';
            this.memberChanged.emit();
          }
          this.addingUserId = null;
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Failed to add member');
          this.addingUserId = null;
        }
      });
  }

  confirmRemove(member: User): void {
    this.memberToRemove = member;
    this.showRemoveDialog = true;
  }

  cancelRemove(): void {
    this.showRemoveDialog = false;
    this.memberToRemove = null;
  }

  removeMember(): void {
    if (!this.memberToRemove) return;
    this.removingMember = true;

    this.projectService.removeMember(this.project.id, this.memberToRemove.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success(`${this.memberToRemove?.fullName} has been removed from the project`);
            this.memberChanged.emit();
          }
          this.showRemoveDialog = false;
          this.memberToRemove = null;
          this.removingMember = false;
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Failed to remove member');
          this.showRemoveDialog = false;
          this.memberToRemove = null;
          this.removingMember = false;
        }
      });
  }

  isOwner(member: User): boolean {
    return this.project.owner?.id === member.id;
  }

  formatRole(role: string): string {
    if (!role) return '';
    return role.replace(/_/g, ' ');
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-50 text-red-700';
      case 'PROJECT_MANAGER':
        return 'bg-purple-50 text-purple-700';
      case 'DEVELOPER':
        return 'bg-blue-50 text-blue-700';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }
}
