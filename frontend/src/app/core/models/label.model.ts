export interface Label {
  id: number;
  name: string;
  color: string;
  projectId: number;
  taskCount: number;
}

export interface LabelRequest {
  name: string;
  color: string;
  projectId: number;
}
