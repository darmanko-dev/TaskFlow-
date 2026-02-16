import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardShortcutService, Shortcut } from '../../../core/services/keyboard-shortcut.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-keyboard-shortcuts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="modal-overlay" (click)="close()">
      <div class="modal-content max-w-md" (click)="$event.stopPropagation()">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h3>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6 space-y-3">
          <div *ngFor="let shortcut of shortcuts" class="flex items-center justify-between py-2">
            <span class="text-sm text-gray-700">{{ shortcut.description }}</span>
            <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">
              {{ formatKey(shortcut) }}
            </kbd>
          </div>
        </div>
      </div>
    </div>
  `
})
export class KeyboardShortcutsComponent implements OnInit, OnDestroy {
  visible = false;
  shortcuts: Shortcut[] = [];
  private sub?: Subscription;

  constructor(private shortcutService: KeyboardShortcutService) {}

  ngOnInit(): void {
    this.shortcuts = this.shortcutService.getShortcuts();
    this.sub = this.shortcutService.showHelp$.subscribe(() => this.visible = true);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close(): void {
    this.visible = false;
  }

  formatKey(shortcut: Shortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  }
}
