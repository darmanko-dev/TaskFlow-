import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
}

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutService implements OnDestroy {
  private shortcuts: Shortcut[] = [];
  showHelp$ = new Subject<boolean>();

  constructor(private router: Router) {
    this.registerDefaults();
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  registerShortcut(shortcut: Shortcut): void {
    this.shortcuts.push(shortcut);
  }

  getShortcuts(): Shortcut[] {
    return this.shortcuts;
  }

  private registerDefaults(): void {
    this.shortcuts = [
      { key: 'd', ctrlKey: false, shiftKey: true, description: 'Go to Dashboard', action: () => this.router.navigate(['/dashboard']) },
      { key: 't', ctrlKey: false, shiftKey: true, description: 'Go to Tasks', action: () => this.router.navigate(['/tasks']) },
      { key: 'p', ctrlKey: false, shiftKey: true, description: 'Go to Projects', action: () => this.router.navigate(['/projects']) },
      { key: '?', ctrlKey: false, shiftKey: false, description: 'Show keyboard shortcuts', action: () => this.showHelp$.next(true) },
    ];
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
      return;
    }

    for (const shortcut of this.shortcuts) {
      if (event.key === shortcut.key &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.shiftKey === !!shortcut.shiftKey) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }
}
