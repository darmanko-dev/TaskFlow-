import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-3xl mx-auto animate-fadeIn">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <div *ngIf="!loading && user" class="space-y-6">
        <!-- Profile Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="h-32 bg-gradient-to-r from-primary to-secondary"></div>
          <div class="px-6 pb-6">
            <div class="flex items-end -mt-12 mb-4">
              <app-avatar [name]="user.fullName" [imageUrl]="user.avatar || ''" [size]="80"
                          class="ring-4 ring-white rounded-full"></app-avatar>
              <div class="ml-4 mb-1">
                <h2 class="text-xl font-bold text-gray-900">{{ user.fullName }}</h2>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
              <span class="ml-auto mb-1 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {{ user.role?.replace('_', ' ') }}
              </span>
            </div>
            <p class="text-sm text-gray-500">
              Member since {{ user.createdAt | date:'longDate' }}
            </p>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input type="text" formControlName="firstName"
                       class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input type="text" formControlName="lastName"
                       class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Avatar URL</label>
              <input type="text" formControlName="avatar"
                     class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                     placeholder="https://example.com/avatar.jpg">
            </div>
            <div class="flex justify-end pt-2">
              <button type="submit" [disabled]="profileForm.invalid || saving"
                      class="px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2">
                <span *ngIf="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  loading = true;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      avatar: ['']
    });
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (res) => {
        this.user = res.data;
        this.profileForm.patchValue({
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          avatar: this.user.avatar || ''
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.user) return;
    this.saving = true;
    this.userService.updateUser(this.user.id, this.profileForm.value).subscribe({
      next: (res) => {
        this.user = res.data;
        this.notificationService.success('Profile updated successfully');
        this.saving = false;
      },
      error: () => {
        this.notificationService.error('Failed to update profile');
        this.saving = false;
      }
    });
  }
}
