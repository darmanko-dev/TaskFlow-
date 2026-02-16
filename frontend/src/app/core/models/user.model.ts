export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'VIEWER';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  role: Role;
  fullName: string;
  createdAt: string;
}
