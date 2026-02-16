import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AvatarComponent } from '../avatar/avatar.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { WebSocketNotificationService } from '../../../core/services/websocket.service';
import { User } from '../../../core/models/user.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AvatarComponent, ClickOutsideDirective, NotificationPanelComponent],
  template: `
    <header class="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
      <div class="flex items-center justify-between h-full px-6">
        <!-- Breadcrumb -->
        <div class="flex items-center text-sm text-gray-500">
          <i class="fas fa-home text-gray-400 mr-2"></i>
          <span>TaskFlow</span>
        </div>

        <!-- Search -->
        <div class="flex-1 max-w-lg mx-8">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input type="text"
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="onSearch($event)"
                   placeholder="Search tasks..."
                   class="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
            <!-- Search Results Dropdown -->
            <div *ngIf="showSearchResults && searchResults.length > 0"
                 class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto"
                 (appClickOutside)="showSearchResults = false">
              <a *ngFor="let task of searchResults"
                 [routerLink]="['/tasks', task.id]"
                 (click)="showSearchResults = false"
                 class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                <span class="text-xs text-gray-400 font-mono">{{ task.taskKey }}</span>
                <span class="text-sm text-gray-700 truncate">{{ task.title }}</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-4">
          <!-- Quick Create -->
          <div class="relative" (appClickOutside)="showCreateMenu = false">
            <button (click)="showCreateMenu = !showCreateMenu"
                    class="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors">
              <i class="fas fa-plus text-sm"></i>
            </button>
            <div *ngIf="showCreateMenu"
                 class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fadeIn">
              <button (click)="createTask()" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <i class="fas fa-check-circle text-blue-500"></i> New Task
              </button>
              <button (click)="createProject()" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <i class="fas fa-folder text-purple-500"></i> New Project
              </button>
            </div>
          </div>

          <!-- Notifications -->
          <div class="relative" (appClickOutside)="showNotifications = false">
            <button (click)="showNotifications = !showNotifications" class="w-8 h-8 text-gray-400 hover:text-gray-600 relative transition-colors">
              <i class="fas fa-bell"></i>
              <span *ngIf="unreadCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
            </button>
            <app-notification-panel *ngIf="showNotifications" (close)="showNotifications = false"></app-notification-panel>
          </div>

          <!-- User Menu -->
          <div class="relative" (appClickOutside)="showUserMenu = false">
            <button (click)="showUserMenu = !showUserMenu" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <app-avatar [name]="currentUser?.fullName || ''" [imageUrl]="currentUser?.avatar || ''" [size]="32"></app-avatar>
            </button>
            <div *ngIf="showUserMenu"
                 class="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fadeIn">
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ currentUser?.fullName }}</p>
                <p class="text-xs text-gray-500">{{ currentUser?.email }}</p>
              </div>
              <a routerLink="/profile" (click)="showUserMenu = false"
                 class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <i class="fas fa-user"></i> Profile
              </a>
              <hr class="my-1 border-gray-100">
              <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent implements OnInit {
  @Output() createNewTask = new EventEmitter<void>();
  @Output() createNewProject = new EventEmitter<void>();

  currentUser: User | null = null;
  searchQuery = '';
  searchResults: any[] = [];
  showSearchResults = false;
  showCreateMenu = false;
  showUserMenu = false;
  showNotifications = false;
  unreadCount = 0;

  private searchSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private wsService: WebSocketNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.wsService.connect();
      }
    });
    this.wsService.unreadCount$.subscribe(count => this.unreadCount = count);
    this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      if (query.length >= 2) {
        this.taskService.searchTasks(query).subscribe(res => {
          this.searchResults = res.data?.content || [];
          this.showSearchResults = true;
        });
      } else {
        this.searchResults = [];
        this.showSearchResults = false;
      }
    });
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  createTask(): void {
    this.showCreateMenu = false;
    this.createNewTask.emit();
  }

  createProject(): void {
    this.showCreateMenu = false;
    this.createNewProject.emit();
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
  }
}
