export interface SprintReport {
  sprintId: number;
  sprintName: string;
  startDate: string;
  endDate: string;
  committedPoints: number;
  completedPoints: number;
  totalTasks: number;
  completedTasks: number;
  addedDuringSprint: number;
  removedDuringSprint: number;
  burndownData: BurndownPoint[];
  tasksByStatus: { [key: string]: number };
  tasksByPriority: { [key: string]: number };
  velocity: number;
}

export interface BurndownPoint {
  date: string;
  ideal: number;
  actual?: number;
}
