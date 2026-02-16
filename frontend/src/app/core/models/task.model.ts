import { User } from './user.model';
import { Comment } from './comment.model';
import { Label } from './label.model';

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
  sprintId: number | null;
  sprintName: string | null;
  epicId: number | null;
  epicName: string | null;
  epicColor: string | null;
  parentTaskId: number | null;
  parentTaskKey: string | null;
  subtasks: Task[];
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  storyPoints: number;
  tags: string[];
  labels: Label[];
  watcherCount: number;
  watching: boolean;
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
  sprintId?: number | null;
  epicId?: number | null;
  parentTaskId?: number | null;
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  storyPoints?: number;
  tags: string[];
  labelIds?: number[];
}

export interface BulkTaskUpdateRequest {
  taskIds: number[];
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  sprintId?: number;
  epicId?: number;
  labelIds?: number[];
}
