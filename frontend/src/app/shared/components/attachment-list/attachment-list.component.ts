import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttachmentService } from '../../../core/services/attachment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Attachment } from '../../../core/models/attachment.model';
import { AvatarComponent } from '../avatar/avatar.component';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule, AvatarComponent, TimeAgoPipe, ConfirmDialogComponent],
  template: `
    <div>
      <!-- Zone de depot -->
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer mb-4"
           (click)="fileInput.click()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           [class.border-blue-500]="isDragging"
           [class.bg-blue-50]="isDragging">
        <i class="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-1"></i>
        <p class="text-sm text-gray-500">Glissez-deposez des fichiers ici ou <span class="text-primary font-medium">parcourir</span></p>
        <p class="text-xs text-gray-400 mt-1">Max 10MB par fichier</p>
        <input #fileInput type="file" class="hidden" multiple (change)="onFileSelect($event)">
      </div>

      <!-- Progression de l'upload -->
      <div *ngIf="uploading" class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-4">
        <i class="fas fa-spinner fa-spin text-primary"></i>
        <span class="text-sm text-primary">Upload en cours...</span>
      </div>

      <!-- Liste des fichiers -->
      <div class="space-y-2">
        <div *ngFor="let attachment of attachments"
             class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
               [ngClass]="getFileTypeClass(attachment.fileType)">
            <i class="fas" [ngClass]="getFileTypeIcon(attachment.fileType)"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ attachment.originalFileName }}</p>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <span>{{ formatFileSize(attachment.fileSize) }}</span>
              <span>par {{ attachment.uploader?.fullName }}</span>
              <span>{{ attachment.createdAt | timeAgo }}</span>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a [href]="getDownloadUrl(attachment.id)" target="_blank"
               class="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-white">
              <i class="fas fa-download text-xs"></i>
            </a>
            <button (click)="confirmDelete = attachment"
                    class="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>

        <div *ngIf="attachments.length === 0 && !uploading" class="text-center py-4">
          <p class="text-sm text-gray-400">Aucune piece jointe</p>
        </div>
      </div>

      <!-- Confirmation de suppression -->
      <app-confirm-dialog *ngIf="confirmDelete"
        title="Supprimer le fichier"
        [message]="'Voulez-vous vraiment supprimer ' + confirmDelete.originalFileName + ' ?'"
        type="danger"
        (confirmed)="deleteAttachment(confirmDelete); confirmDelete = null"
        (cancelled)="confirmDelete = null">
      </app-confirm-dialog>
    </div>
  `
})
export class AttachmentListComponent implements OnInit {
  @Input() taskId!: number;

  attachments: Attachment[] = [];
  uploading = false;
  isDragging = false;
  confirmDelete: Attachment | null = null;

  constructor(
    private attachmentService: AttachmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAttachments();
  }

  loadAttachments(): void {
    this.attachmentService.getTaskAttachments(this.taskId).subscribe(res => {
      if (res.success) {
        this.attachments = res.data;
      }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => this.uploadFile(file));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach(file => this.uploadFile(file));
    }
  }

  uploadFile(file: File): void {
    if (file.size > 10 * 1024 * 1024) {
      this.notificationService.error('Le fichier depasse la taille maximale de 10MB');
      return;
    }

    this.uploading = true;
    this.attachmentService.uploadAttachment(this.taskId, file).subscribe({
      next: (res) => {
        if (res.success) {
          this.attachments.unshift(res.data);
          this.notificationService.success('Fichier televerse');
        }
        this.uploading = false;
      },
      error: () => {
        this.notificationService.error('Erreur lors du telechargement');
        this.uploading = false;
      }
    });
  }

  deleteAttachment(attachment: Attachment): void {
    this.attachmentService.deleteAttachment(attachment.id).subscribe(res => {
      if (res.success) {
        this.attachments = this.attachments.filter(a => a.id !== attachment.id);
        this.notificationService.success('Fichier supprime');
      }
    });
  }

  getDownloadUrl(id: number): string {
    return this.attachmentService.getDownloadUrl(id);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileTypeIcon(type: string): string {
    if (type?.startsWith('image/')) return 'fa-image';
    if (type?.includes('pdf')) return 'fa-file-pdf';
    if (type?.includes('word') || type?.includes('document')) return 'fa-file-word';
    if (type?.includes('sheet') || type?.includes('excel')) return 'fa-file-excel';
    if (type?.includes('zip') || type?.includes('rar')) return 'fa-file-archive';
    return 'fa-file';
  }

  getFileTypeClass(type: string): string {
    if (type?.startsWith('image/')) return 'bg-purple-100 text-purple-600';
    if (type?.includes('pdf')) return 'bg-red-100 text-red-600';
    if (type?.includes('word') || type?.includes('document')) return 'bg-blue-100 text-blue-600';
    if (type?.includes('sheet') || type?.includes('excel')) return 'bg-green-100 text-green-600';
    return 'bg-gray-100 text-gray-600';
  }
}
