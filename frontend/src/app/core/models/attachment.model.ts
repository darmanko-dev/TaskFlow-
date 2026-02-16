import { User } from './user.model';

export interface Attachment {
  id: number;
  taskId: number;
  uploader: User;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  createdAt: string;
}
