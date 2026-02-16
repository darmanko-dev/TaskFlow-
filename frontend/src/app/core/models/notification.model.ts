export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: number;
  read: boolean;
  createdAt: string;
}
