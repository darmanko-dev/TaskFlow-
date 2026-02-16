import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center justify-center rounded-full bg-primary text-white font-semibold overflow-hidden"
         [ngStyle]="{'width.px': size, 'height.px': size, 'font-size.px': size * 0.4}">
      <img *ngIf="imageUrl" [src]="imageUrl" [alt]="name" class="w-full h-full object-cover"
           (error)="imageUrl = ''">
      <span *ngIf="!imageUrl">{{ initials }}</span>
    </div>
  `
})
export class AvatarComponent {
  @Input() name: string = '';
  @Input() imageUrl: string = '';
  @Input() size: number = 32;

  get initials(): string {
    if (!this.name) return '?';
    const parts = this.name.split(' ');
    return parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
  }
}
