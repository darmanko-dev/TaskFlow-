import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-secondary flex">
      <!-- Left Branding Panel -->
      <div class="hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-white p-12">
        <div class="max-w-md">
          <div class="flex items-center gap-3 mb-8">
            <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <i class="fas fa-bolt text-2xl"></i>
            </div>
            <span class="text-3xl font-bold">TaskFlow</span>
          </div>
          <h1 class="text-4xl font-bold mb-6 leading-tight">Manage your projects with confidence</h1>
          <p class="text-lg text-white/80 mb-8">A powerful project management platform with Kanban boards, real-time collaboration, and insightful analytics.</p>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <i class="fas fa-check text-sm"></i>
              </div>
              <span class="text-white/90">Kanban boards with drag & drop</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <i class="fas fa-check text-sm"></i>
              </div>
              <span class="text-white/90">Real-time dashboard analytics</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <i class="fas fa-check text-sm"></i>
              </div>
              <span class="text-white/90">Team collaboration & comments</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content Panel -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div class="w-full max-w-md">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
