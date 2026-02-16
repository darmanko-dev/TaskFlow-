import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar.component';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  template: `
    <aside class="fixed left-0 top-0 h-full bg-sidebar text-white z-40 transition-all duration-300 flex flex-col"
           [class.w-64]="!collapsed" [class.w-16]="collapsed">
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-white/10">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="fas fa-bolt text-white text-sm"></i>
          </div>
          <span *ngIf="!collapsed" class="text-lg font-bold whitespace-nowrap">TaskFlow</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1 px-3">
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-primary/20 text-primary-light"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all group">
              <i class="fas fa-th-large w-5 text-center text-sm"></i>
              <span *ngIf="!collapsed" class="text-sm font-medium">Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/tasks" routerLinkActive="bg-primary/20 text-primary-light"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all group">
              <i class="fas fa-check-circle w-5 text-center text-sm"></i>
              <span *ngIf="!collapsed" class="text-sm font-medium">My Tasks</span>
            </a>
          </li>
          <li>
            <a routerLink="/projects" routerLinkActive="bg-primary/20 text-primary-light"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all group">
              <i class="fas fa-folder w-5 text-center text-sm"></i>
              <span *ngIf="!collapsed" class="text-sm font-medium">Projects</span>
            </a>
          </li>
        </ul>

        <!-- Recent Projects -->
        <div *ngIf="!collapsed" class="mt-8 px-3">
          <h4 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Projects</h4>
          <ul class="space-y-1">
            <li *ngFor="let project of recentProjects">
              <a [routerLink]="['/projects', project.id]"
                 class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm">
                <span class="w-2 h-2 rounded-full flex-shrink-0"
                      [ngClass]="{'bg-blue-400': project.status === 'ACTIVE', 'bg-green-400': project.status === 'COMPLETED', 'bg-gray-400': project.status === 'ARCHIVED'}"></span>
                <span class="truncate">{{ project.name }}</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Collapse Toggle -->
      <button (click)="toggleCollapse()"
              class="mx-3 mb-2 p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center">
        <i class="fas" [ngClass]="collapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>

      <!-- User Profile -->
      <div class="border-t border-white/10 p-3">
        <a routerLink="/profile" class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
          <app-avatar [name]="currentUser?.fullName || ''" [imageUrl]="currentUser?.avatar || ''" [size]="32"></app-avatar>
          <div *ngIf="!collapsed" class="overflow-hidden">
            <p class="text-sm font-medium text-white truncate">{{ currentUser?.fullName }}</p>
            <p class="text-xs text-gray-400 truncate">{{ currentUser?.role?.replace('_', ' ') }}</p>
          </div>
        </a>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  currentUser: User | null = null;
  recentProjects: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  setRecentProjects(projects: any[]): void {
    this.recentProjects = projects.slice(0, 5);
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
