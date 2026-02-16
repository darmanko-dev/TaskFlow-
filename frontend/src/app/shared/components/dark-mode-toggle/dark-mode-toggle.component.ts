import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="toggle()" class="w-8 h-8 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors" title="Toggle dark mode">
      <i class="fas" [ngClass]="isDark ? 'fa-sun' : 'fa-moon'"></i>
    </button>
  `
})
export class DarkModeToggleComponent implements OnInit, OnDestroy {
  isDark = false;
  private sub?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.sub = this.themeService.darkMode$.subscribe(dark => this.isDark = dark);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggle(): void {
    this.themeService.toggleDarkMode();
  }
}
