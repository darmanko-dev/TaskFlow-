import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="bg-white rounded-2xl shadow-2xl p-8 animate-fadeIn">
      <!-- Logo for mobile -->
      <div class="lg:hidden flex items-center gap-3 mb-6 justify-center">
        <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <i class="fas fa-bolt text-white text-lg"></i>
        </div>
        <span class="text-2xl font-bold text-gray-900">TaskFlow</span>
      </div>

      <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
      <p class="text-gray-500 mb-8">Sign in to your account to continue</p>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div class="relative">
              <i class="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="email" formControlName="email"
                     class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                     placeholder="Enter your email"
                     [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            </div>
            <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
               class="mt-1 text-xs text-red-500">Please enter a valid email address</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div class="relative">
              <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input [type]="showPassword ? 'text' : 'password'" formControlName="password"
                     class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                     placeholder="Enter your password"
                     [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <button type="button" (click)="showPassword = !showPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <i class="fas" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
               class="mt-1 text-xs text-red-500">Password is required</p>
          </div>
        </div>

        <button type="submit" [disabled]="loginForm.invalid || loading"
                class="w-full mt-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <span *ngIf="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Don't have an account?
        <a routerLink="/register" class="text-primary font-medium hover:underline">Create one</a>
      </p>

      <!-- Demo Accounts -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <p class="text-xs text-gray-400 text-center mb-3">Demo Accounts</p>
        <div class="grid grid-cols-2 gap-2">
          <button (click)="fillDemo('admin@taskflow.com')" type="button"
                  class="text-xs py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            Admin
          </button>
          <button (click)="fillDemo('sarah@taskflow.com')" type="button"
                  class="text-xs py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            Project Manager
          </button>
          <button (click)="fillDemo('thomas@taskflow.com')" type="button"
                  class="text-xs py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            Developer (Thomas)
          </button>
          <button (click)="fillDemo('marie@taskflow.com')" type="button"
                  class="text-xs py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            Developer (Marie)
          </button>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  fillDemo(email: string): void {
    this.loginForm.patchValue({ email, password: 'password123' });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.notificationService.success('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.error?.message || 'Invalid email or password');
      }
    });
  }
}
