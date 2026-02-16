import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="bg-white rounded-2xl shadow-2xl p-8 animate-fadeIn">
      <div class="lg:hidden flex items-center gap-3 mb-6 justify-center">
        <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <i class="fas fa-bolt text-white text-lg"></i>
        </div>
        <span class="text-2xl font-bold text-gray-900">TaskFlow</span>
      </div>

      <h2 class="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
      <p class="text-gray-500 mb-8">Start managing your projects today</p>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input type="text" formControlName="firstName"
                     class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                     placeholder="John"
                     [class.border-red-500]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
              <p *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                 class="mt-1 text-xs text-red-500">First name is required</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input type="text" formControlName="lastName"
                     class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                     placeholder="Doe"
                     [class.border-red-500]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
              <p *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                 class="mt-1 text-xs text-red-500">Last name is required</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div class="relative">
              <i class="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="email" formControlName="email"
                     class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                     placeholder="john@example.com"
                     [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
            </div>
            <p *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
               class="mt-1 text-xs text-red-500">Please enter a valid email</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div class="relative">
              <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input [type]="showPassword ? 'text' : 'password'" formControlName="password"
                     class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                     placeholder="Min 6 characters"
                     [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <button type="button" (click)="showPassword = !showPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <i class="fas" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            <p *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
               class="mt-1 text-xs text-red-500">Password must be at least 6 characters</p>
          </div>
        </div>

        <button type="submit" [disabled]="registerForm.invalid || loading"
                class="w-full mt-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <span *ngIf="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Already have an account?
        <a routerLink="/login" class="text-primary font-medium hover:underline">Sign in</a>
      </p>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    const { firstName, lastName, email, password } = this.registerForm.value;
    this.authService.register(firstName, lastName, email, password).subscribe({
      next: () => {
        this.notificationService.success('Account created successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.error?.message || 'Registration failed');
      }
    });
  }
}
