export interface Epic {
  id: number;
  name: string;
  description: string;
  color: string;
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface EpicRequest {
  name: string;
  description?: string;
  color?: string;
  projectId: number;
}
