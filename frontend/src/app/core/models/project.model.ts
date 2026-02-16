import { User } from './user.model';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export interface Project {
  id: number;
  name: string;
  description: string;
  key: string;
  status: ProjectStatus;
  owner: User;
  members: User[];
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
}

export interface ProjectRequest {
  name: string;
  description: string;
  key: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
}
