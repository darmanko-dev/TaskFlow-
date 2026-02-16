import { User } from './user.model';

export interface Comment {
  id: number;
  content: string;
  author: User;
  taskId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRequest {
  content: string;
}
