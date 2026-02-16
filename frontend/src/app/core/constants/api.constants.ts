import { environment } from '../../../environments/environment';

export const API_URL = environment.apiUrl;

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    refresh: `${API_URL}/auth/refresh`,
    logout: `${API_URL}/auth/logout`,
    me: `${API_URL}/auth/me`
  },
  users: {
    base: `${API_URL}/users`,
    byId: (id: number) => `${API_URL}/users/${id}`,
    profile: `${API_URL}/users/profile`,
    updateProfile: `${API_URL}/users/profile`,
    changePassword: `${API_URL}/users/change-password`
  },
  projects: {
    base: `${API_URL}/projects`,
    byId: (id: number) => `${API_URL}/projects/${id}`,
    members: (id: number) => `${API_URL}/projects/${id}/members`,
    addMember: (projectId: number, userId: number) =>
      `${API_URL}/projects/${projectId}/members/${userId}`,
    removeMember: (projectId: number, userId: number) =>
      `${API_URL}/projects/${projectId}/members/${userId}`,
    tasks: (id: number) => `${API_URL}/projects/${id}/tasks`
  },
  tasks: {
    base: `${API_URL}/tasks`,
    byId: (id: number) => `${API_URL}/tasks/${id}`,
    byProject: (projectId: number) => `${API_URL}/projects/${projectId}/tasks`,
    assignee: (taskId: number) => `${API_URL}/tasks/${taskId}/assignee`,
    status: (taskId: number) => `${API_URL}/tasks/${taskId}/status`,
    myTasks: `${API_URL}/tasks/my-tasks`,
    overdue: `${API_URL}/tasks/overdue`
  },
  comments: {
    byTask: (taskId: number) => `${API_URL}/tasks/${taskId}/comments`,
    byId: (taskId: number, commentId: number) =>
      `${API_URL}/tasks/${taskId}/comments/${commentId}`
  },
  dashboard: {
    stats: `${API_URL}/dashboard/stats`
  },
  sprints: {
    base: `${API_URL}/sprints`,
    byId: (id: number) => `${API_URL}/sprints/${id}`,
    byProject: (projectId: number) => `${API_URL}/sprints/project/${projectId}`,
    tasks: (id: number) => `${API_URL}/sprints/${id}/tasks`,
    backlog: (projectId: number) => `${API_URL}/sprints/project/${projectId}/backlog`,
    start: (id: number) => `${API_URL}/sprints/${id}/start`,
    complete: (id: number) => `${API_URL}/sprints/${id}/complete`,
    addTask: (sprintId: number, taskId: number) => `${API_URL}/sprints/${sprintId}/tasks/${taskId}`,
    removeTask: (sprintId: number, taskId: number) => `${API_URL}/sprints/${sprintId}/tasks/${taskId}`
  },
  epics: {
    base: `${API_URL}/epics`,
    byId: (id: number) => `${API_URL}/epics/${id}`,
    byProject: (projectId: number) => `${API_URL}/epics/project/${projectId}`
  },
  activities: {
    base: `${API_URL}/activities`,
    byProject: (projectId: number) => `${API_URL}/activities/project/${projectId}`,
    byEntity: (entityType: string, entityId: number) => `${API_URL}/activities/entity/${entityType}/${entityId}`
  },
  notifications: {
    base: `${API_URL}/notifications`,
    unreadCount: `${API_URL}/notifications/unread-count`,
    markRead: (id: number) => `${API_URL}/notifications/${id}/read`,
    markAllRead: `${API_URL}/notifications/read-all`
  },
  attachments: {
    byTask: (taskId: number) => `${API_URL}/attachments/task/${taskId}`,
    upload: (taskId: number) => `${API_URL}/attachments/task/${taskId}`,
    download: (id: number) => `${API_URL}/attachments/${id}/download`,
    delete: (id: number) => `${API_URL}/attachments/${id}`
  }
};
