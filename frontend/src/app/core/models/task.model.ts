import { User } from './user.model';
import { Comment } from './comment.model';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Task {
  id: number;
  taskKey: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  projectName: string;
  projectKey: string;
  assignee: User | null;
  reporter: User;
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  overdue: boolean;
}

export interface TaskRequest {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assigneeId: number | null;
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
}
