import { User } from './user.model';

export interface ActivityLog {
  id: number;
  user: User;
  action: string;
  entityType: string;
  entityId: number;
  entityName: string;
  details: string;
  projectId: number;
  createdAt: string;
}
