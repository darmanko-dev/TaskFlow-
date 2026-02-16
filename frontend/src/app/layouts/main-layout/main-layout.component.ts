import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-surface">
      <app-sidebar [collapsed]="sidebarCollapsed" (collapsedChange)="sidebarCollapsed = $event"></app-sidebar>
      <div class="transition-all duration-300" [class.ml-64]="!sidebarCollapsed" [class.ml-16]="sidebarCollapsed">
        <app-navbar
          (createNewTask)="onCreateTask()"
          (createNewProject)="onCreateProject()">
        </app-navbar>
        <main class="p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toast></app-toast>
    </div>
  `
})
export class MainLayoutComponent {
  sidebarCollapsed = false;

  constructor(private router: Router) {}

  onCreateTask(): void {
    this.router.navigate(['/tasks'], { queryParams: { create: true } });
  }

  onCreateProject(): void {
    this.router.navigate(['/projects'], { queryParams: { create: true } });
  }
}
