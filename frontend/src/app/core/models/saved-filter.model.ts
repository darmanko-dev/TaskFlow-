export interface SavedFilter {
  id: number;
  name: string;
  filterJson: string;
  userId: number;
  userName: string;
  projectId: number | null;
  shared: boolean;
  createdAt: string;
}

export interface SavedFilterRequest {
  name: string;
  filterJson: string;
  projectId?: number;
  shared: boolean;
}
