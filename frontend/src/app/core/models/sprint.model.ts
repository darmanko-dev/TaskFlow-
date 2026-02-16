export enum SprintStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export interface Sprint {
  id: number;
  name: string;
  goal: string;
  projectId: number;
  projectName: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface SprintRequest {
  name: string;
  goal: string;
  projectId: number;
  status?: SprintStatus;
  startDate?: string;
  endDate?: string;
}
