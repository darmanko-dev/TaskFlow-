/**
 * TaskFlow Mock Backend Server
 * Simulates the Spring Boot backend API for local testing
 */

const express = require('/home/user/TaskFlow-/frontend/node_modules/express');
const app = express();
const PORT = 8080;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Expose-Headers', 'Authorization, Content-Disposition');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Helper: wrap data in ApiResponse format
function apiSuccess(data, message) {
  return { success: true, message: message || null, data, timestamp: new Date().toISOString() };
}

// Helper: generate a fake JWT that won't expire for 24h
function generateJWT(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  })).toString('base64url');
  const signature = Buffer.from('mock-signature').toString('base64url');
  return `${header}.${payload}.${signature}`;
}

// ==================== DEMO DATA ====================

const now = new Date().toISOString();
const today = new Date().toISOString().split('T')[0];

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; }

const users = [
  { id: 1, firstName: 'Admin', lastName: 'User', email: 'admin@taskflow.com', avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=2563EB&color=fff', role: 'ADMIN', fullName: 'Admin User', createdAt: now },
  { id: 2, firstName: 'Sarah', lastName: 'Martin', email: 'sarah@taskflow.com', avatar: 'https://ui-avatars.com/api/?name=Sarah+Martin&background=7C3AED&color=fff', role: 'PROJECT_MANAGER', fullName: 'Sarah Martin', createdAt: now },
  { id: 3, firstName: 'Thomas', lastName: 'Dubois', email: 'thomas@taskflow.com', avatar: 'https://ui-avatars.com/api/?name=Thomas+Dubois&background=10B981&color=fff', role: 'DEVELOPER', fullName: 'Thomas Dubois', createdAt: now },
  { id: 4, firstName: 'Marie', lastName: 'Laurent', email: 'marie@taskflow.com', avatar: 'https://ui-avatars.com/api/?name=Marie+Laurent&background=F59E0B&color=fff', role: 'DEVELOPER', fullName: 'Marie Laurent', createdAt: now }
];

const projects = [
  { id: 1, name: 'TaskFlow Platform', description: 'Main project management platform with kanban boards, dashboards, and team collaboration features.', key: 'TF', status: 'ACTIVE', owner: users[1], members: users, startDate: daysAgo(60), endDate: daysFromNow(120), createdAt: now, updatedAt: now, totalTasks: 13, completedTasks: 4, progressPercentage: 30.8 },
  { id: 2, name: 'Mobile App v2', description: 'Second version of the mobile application with improved UX and offline capabilities.', key: 'MA', status: 'ACTIVE', owner: users[1], members: [users[1], users[2], users[3]], startDate: daysAgo(21), endDate: daysFromNow(90), createdAt: now, updatedAt: now, totalTasks: 5, completedTasks: 1, progressPercentage: 20.0 },
  { id: 3, name: 'API Migration', description: 'Migrating legacy REST API to modern GraphQL architecture.', key: 'AM', status: 'COMPLETED', owner: users[0], members: [users[0], users[2]], startDate: daysAgo(120), endDate: daysAgo(7), createdAt: now, updatedAt: now, totalTasks: 3, completedTasks: 3, progressPercentage: 100.0 }
];

const epics = [
  { id: 1, name: 'Authentication & Security', description: 'All authentication and security related features', color: '#EF4444', projectId: 1, projectName: 'TaskFlow Platform', totalTasks: 3, completedTasks: 1, progressPercentage: 33.3, createdAt: now, updatedAt: now },
  { id: 2, name: 'User Interface', description: 'UI/UX design and frontend implementation', color: '#6366F1', projectId: 1, projectName: 'TaskFlow Platform', totalTasks: 6, completedTasks: 1, progressPercentage: 16.7, createdAt: now, updatedAt: now },
  { id: 3, name: 'Infrastructure', description: 'DevOps, CI/CD, and infrastructure tasks', color: '#10B981', projectId: 1, projectName: 'TaskFlow Platform', totalTasks: 2, completedTasks: 1, progressPercentage: 50.0, createdAt: now, updatedAt: now },
  { id: 4, name: 'Mobile UX', description: 'User experience improvements for mobile', color: '#F59E0B', projectId: 2, projectName: 'Mobile App v2', totalTasks: 3, completedTasks: 1, progressPercentage: 33.3, createdAt: now, updatedAt: now },
  { id: 5, name: 'Mobile Security', description: 'Security features for mobile app', color: '#8B5CF6', projectId: 2, projectName: 'Mobile App v2', totalTasks: 1, completedTasks: 0, progressPercentage: 0, createdAt: now, updatedAt: now }
];

const sprints = [
  { id: 1, name: 'Sprint 1 - Foundation', goal: 'Setup core infrastructure and authentication', projectId: 1, projectName: 'TaskFlow Platform', status: 'COMPLETED', startDate: daysAgo(28), endDate: daysAgo(14), totalTasks: 3, completedTasks: 3, todoTasks: 0, inProgressTasks: 0, progressPercentage: 100, createdAt: now, updatedAt: now },
  { id: 2, name: 'Sprint 2 - Core Features', goal: 'Implement kanban board and task management', projectId: 1, projectName: 'TaskFlow Platform', status: 'ACTIVE', startDate: daysAgo(14), endDate: daysFromNow(7), totalTasks: 6, completedTasks: 1, todoTasks: 1, inProgressTasks: 3, progressPercentage: 16.7, createdAt: now, updatedAt: now },
  { id: 3, name: 'Sprint 3 - Polish', goal: 'Documentation, notifications, and UI improvements', projectId: 1, projectName: 'TaskFlow Platform', status: 'PLANNING', startDate: daysFromNow(7), endDate: daysFromNow(21), totalTasks: 2, completedTasks: 0, todoTasks: 2, inProgressTasks: 0, progressPercentage: 0, createdAt: now, updatedAt: now },
  { id: 4, name: 'Sprint 1 - Mobile Core', goal: 'Navigation and offline mode', projectId: 2, projectName: 'Mobile App v2', status: 'ACTIVE', startDate: daysAgo(7), endDate: daysFromNow(14), totalTasks: 3, completedTasks: 1, todoTasks: 0, inProgressTasks: 1, progressPercentage: 33.3, createdAt: now, updatedAt: now }
];

let taskIdCounter = 22;
const tasks = [
  // TaskFlow Platform - Sprint 1 (COMPLETED)
  { id: 1, taskKey: 'TF-001', title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', status: 'DONE', priority: 'HIGH', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[2], reporter: users[1], sprintId: 1, sprintName: 'Sprint 1 - Foundation', epicId: 3, epicName: 'Infrastructure', epicColor: '#10B981', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysAgo(10), estimatedHours: 8, loggedHours: 10, storyPoints: 5, tags: ['devops', 'automation'], labels: [], watcherCount: 2, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 2, taskKey: 'TF-002', title: 'Design user dashboard', description: 'Create wireframes and mockups for the main dashboard.', status: 'DONE', priority: 'HIGH', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[3], reporter: users[1], sprintId: 1, sprintName: 'Sprint 1 - Foundation', epicId: 2, epicName: 'User Interface', epicColor: '#6366F1', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysAgo(5), estimatedHours: 12, loggedHours: 14, storyPoints: 8, tags: ['design', 'ui'], labels: [], watcherCount: 3, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 3, taskKey: 'TF-003', title: 'Implement authentication system', description: 'Build JWT-based authentication with login, register, and RBAC.', status: 'DONE', priority: 'CRITICAL', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[2], reporter: users[1], sprintId: 1, sprintName: 'Sprint 1 - Foundation', epicId: 1, epicName: 'Authentication & Security', epicColor: '#EF4444', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysAgo(15), estimatedHours: 16, loggedHours: 18, storyPoints: 13, tags: ['security', 'backend'], labels: [], watcherCount: 4, watching: true, comments: [], createdAt: now, updatedAt: now, overdue: false },
  // TaskFlow Platform - Sprint 2 (ACTIVE)
  { id: 4, taskKey: 'TF-004', title: 'Fix login redirect bug', description: 'Users not redirected after login. Check auth guard.', status: 'IN_PROGRESS', priority: 'HIGH', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[2], reporter: users[1], sprintId: 2, sprintName: 'Sprint 2 - Core Features', epicId: 1, epicName: 'Authentication & Security', epicColor: '#EF4444', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(2), estimatedHours: 3, loggedHours: 1.5, storyPoints: 2, tags: ['bug', 'auth'], labels: [], watcherCount: 2, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 5, taskKey: 'TF-005', title: 'Implement drag and drop', description: 'Add drag and drop to kanban board with smooth animations.', status: 'IN_PROGRESS', priority: 'CRITICAL', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[3], reporter: users[1], sprintId: 2, sprintName: 'Sprint 2 - Core Features', epicId: 2, epicName: 'User Interface', epicColor: '#6366F1', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(5), estimatedHours: 10, loggedHours: 4, storyPoints: 8, tags: ['frontend', 'feature'], labels: [], watcherCount: 3, watching: true, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 6, taskKey: 'TF-006', title: 'Write API documentation', description: 'Document all REST API endpoints using Swagger/OpenAPI.', status: 'IN_REVIEW', priority: 'MEDIUM', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[2], reporter: users[1], sprintId: 2, sprintName: 'Sprint 2 - Core Features', epicId: null, epicName: null, epicColor: null, parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(1), estimatedHours: 6, loggedHours: 5, storyPoints: 3, tags: ['docs', 'api'], labels: [], watcherCount: 1, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  // TaskFlow Platform - Sprint 3 (PLANNING)
  { id: 7, taskKey: 'TF-007', title: 'Add email notifications', description: 'Implement email notifications for task assignments and status changes.', status: 'TODO', priority: 'MEDIUM', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: null, reporter: users[1], sprintId: 3, sprintName: 'Sprint 3 - Polish', epicId: null, epicName: null, epicColor: null, parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(14), estimatedHours: 12, loggedHours: 0, storyPoints: 5, tags: ['feature', 'notifications'], labels: [], watcherCount: 0, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 8, taskKey: 'TF-008', title: 'Optimize database queries', description: 'Review and optimize slow queries. Add proper indexing.', status: 'TODO', priority: 'HIGH', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[2], reporter: users[1], sprintId: 3, sprintName: 'Sprint 3 - Polish', epicId: 3, epicName: 'Infrastructure', epicColor: '#10B981', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(7), estimatedHours: 8, loggedHours: 0, storyPoints: 5, tags: ['backend', 'performance'], labels: [], watcherCount: 1, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  // TaskFlow Platform - Backlog
  { id: 9, taskKey: 'TF-009', title: 'Create onboarding flow', description: 'Design guided onboarding with tooltips and welcome wizard.', status: 'TODO', priority: 'LOW', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[3], reporter: users[1], sprintId: null, sprintName: null, epicId: 2, epicName: 'User Interface', epicColor: '#6366F1', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(21), estimatedHours: 10, loggedHours: 0, storyPoints: 5, tags: ['ux', 'feature'], labels: [], watcherCount: 0, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 10, taskKey: 'TF-010', title: 'Add dark mode support', description: 'Implement dark mode toggle with system preference detection.', status: 'TODO', priority: 'LOW', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: null, reporter: users[1], sprintId: null, sprintName: null, epicId: 2, epicName: 'User Interface', epicColor: '#6366F1', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(30), estimatedHours: 8, loggedHours: 0, storyPoints: 3, tags: ['frontend', 'ui'], labels: [], watcherCount: 0, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  // Subtasks of "Implement drag and drop" (id: 5)
  { id: 11, taskKey: 'TF-011', title: 'Setup CDK drag module', description: 'Install and configure Angular CDK Drag & Drop module.', status: 'DONE', priority: 'MEDIUM', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[3], reporter: users[1], sprintId: 2, sprintName: 'Sprint 2 - Core Features', epicId: 2, epicName: 'User Interface', epicColor: '#6366F1', parentTaskId: 5, parentTaskKey: 'TF-005', subtasks: [], dueDate: daysFromNow(3), estimatedHours: 2, loggedHours: 2, storyPoints: 1, tags: ['frontend'], labels: [], watcherCount: 0, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 12, taskKey: 'TF-012', title: 'Implement column drop zones', description: 'Create drop zones for each kanban column.', status: 'IN_PROGRESS', priority: 'MEDIUM', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[3], reporter: users[1], sprintId: 2, sprintName: 'Sprint 2 - Core Features', epicId: 2, epicName: 'User Interface', epicColor: '#6366F1', parentTaskId: 5, parentTaskKey: 'TF-005', subtasks: [], dueDate: daysFromNow(4), estimatedHours: 4, loggedHours: 2, storyPoints: 3, tags: ['frontend'], labels: [], watcherCount: 0, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 13, taskKey: 'TF-013', title: 'Add drag animations', description: 'Add smooth animations during drag operations.', status: 'TODO', priority: 'LOW', projectId: 1, projectName: 'TaskFlow Platform', projectKey: 'TF', assignee: users[3], reporter: users[1], sprintId: 2, sprintName: 'Sprint 2 - Core Features', epicId: 2, epicName: 'User Interface', epicColor: '#6366F1', parentTaskId: 5, parentTaskKey: 'TF-005', subtasks: [], dueDate: daysFromNow(5), estimatedHours: 3, loggedHours: 0, storyPoints: 2, tags: ['frontend', 'animation'], labels: [], watcherCount: 0, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  // Mobile App v2
  { id: 14, taskKey: 'MA-001', title: 'Design app navigation', description: 'Create bottom tab navigation with animations.', status: 'DONE', priority: 'HIGH', projectId: 2, projectName: 'Mobile App v2', projectKey: 'MA', assignee: users[3], reporter: users[1], sprintId: 4, sprintName: 'Sprint 1 - Mobile Core', epicId: 4, epicName: 'Mobile UX', epicColor: '#F59E0B', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysAgo(7), estimatedHours: 6, loggedHours: 7, storyPoints: 3, tags: ['design', 'mobile'], labels: [], watcherCount: 1, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 15, taskKey: 'MA-002', title: 'Implement offline mode', description: 'Add offline persistence using SQLite and sync mechanism.', status: 'IN_PROGRESS', priority: 'CRITICAL', projectId: 2, projectName: 'Mobile App v2', projectKey: 'MA', assignee: users[2], reporter: users[1], sprintId: 4, sprintName: 'Sprint 1 - Mobile Core', epicId: 4, epicName: 'Mobile UX', epicColor: '#F59E0B', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(10), estimatedHours: 20, loggedHours: 8, storyPoints: 13, tags: ['mobile', 'feature'], labels: [], watcherCount: 2, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 16, taskKey: 'MA-003', title: 'Push notification service', description: 'Integrate Firebase Cloud Messaging.', status: 'TODO', priority: 'HIGH', projectId: 2, projectName: 'Mobile App v2', projectKey: 'MA', assignee: users[2], reporter: users[1], sprintId: null, sprintName: null, epicId: null, epicName: null, epicColor: null, parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(15), estimatedHours: 10, loggedHours: 0, storyPoints: 5, tags: ['mobile', 'notifications'], labels: [], watcherCount: 0, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 17, taskKey: 'MA-004', title: 'Performance optimization', description: 'Reduce startup time and optimize list rendering.', status: 'IN_REVIEW', priority: 'MEDIUM', projectId: 2, projectName: 'Mobile App v2', projectKey: 'MA', assignee: users[3], reporter: users[1], sprintId: 4, sprintName: 'Sprint 1 - Mobile Core', epicId: 4, epicName: 'Mobile UX', epicColor: '#F59E0B', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(3), estimatedHours: 8, loggedHours: 6, storyPoints: 5, tags: ['performance', 'mobile'], labels: [], watcherCount: 1, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 18, taskKey: 'MA-005', title: 'Biometric authentication', description: 'Add fingerprint and Face ID authentication.', status: 'TODO', priority: 'MEDIUM', projectId: 2, projectName: 'Mobile App v2', projectKey: 'MA', assignee: null, reporter: users[1], sprintId: null, sprintName: null, epicId: 5, epicName: 'Mobile Security', epicColor: '#8B5CF6', parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysFromNow(20), estimatedHours: 6, loggedHours: 0, storyPoints: 3, tags: ['security', 'mobile'], labels: [], watcherCount: 0, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  // API Migration (COMPLETED)
  { id: 19, taskKey: 'AM-001', title: 'Define GraphQL schema', description: 'Create complete GraphQL schema with types and mutations.', status: 'DONE', priority: 'CRITICAL', projectId: 3, projectName: 'API Migration', projectKey: 'AM', assignee: users[2], reporter: users[0], sprintId: null, sprintName: null, epicId: null, epicName: null, epicColor: null, parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysAgo(30), estimatedHours: 12, loggedHours: 14, storyPoints: 8, tags: ['graphql', 'backend'], labels: [], watcherCount: 1, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 20, taskKey: 'AM-002', title: 'Migrate user endpoints', description: 'Migrate REST endpoints to GraphQL resolvers.', status: 'DONE', priority: 'HIGH', projectId: 3, projectName: 'API Migration', projectKey: 'AM', assignee: users[2], reporter: users[0], sprintId: null, sprintName: null, epicId: null, epicName: null, epicColor: null, parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysAgo(20), estimatedHours: 8, loggedHours: 9, storyPoints: 5, tags: ['migration', 'backend'], labels: [], watcherCount: 0, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false },
  { id: 21, taskKey: 'AM-003', title: 'Migration testing', description: 'Comprehensive testing of all migrated endpoints.', status: 'DONE', priority: 'HIGH', projectId: 3, projectName: 'API Migration', projectKey: 'AM', assignee: users[2], reporter: users[0], sprintId: null, sprintName: null, epicId: null, epicName: null, epicColor: null, parentTaskId: null, parentTaskKey: null, subtasks: [], dueDate: daysAgo(10), estimatedHours: 10, loggedHours: 12, storyPoints: 5, tags: ['testing', 'qa'], labels: [], watcherCount: 0, watching: false, comments: [], createdAt: now, updatedAt: now, overdue: false }
];

// Set subtasks for task 5
tasks[4].subtasks = [tasks[10], tasks[11], tasks[12]];

const comments = [
  { id: 1, content: "I've started investigating this. It seems like the auth guard is not properly checking the token expiration.", author: users[2], taskId: 4, createdAt: now, updatedAt: now },
  { id: 2, content: "Can we prioritize this? It's affecting the demo scheduled for next week.", author: users[1], taskId: 4, createdAt: now, updatedAt: now },
  { id: 3, content: "Found the issue - the redirect URL was being lost during the OAuth flow. Working on a fix now.", author: users[2], taskId: 4, createdAt: now, updatedAt: now },
  { id: 4, content: "I'm using Angular CDK Drag & Drop for this. The basic functionality is working, now adding animations.", author: users[3], taskId: 5, createdAt: now, updatedAt: now },
  { id: 5, content: "Looks great so far! Can you also add a visual indicator when hovering over a column?", author: users[1], taskId: 5, createdAt: now, updatedAt: now },
  { id: 6, content: "PR submitted for review. I've documented all 25 endpoints with request/response examples.", author: users[2], taskId: 6, createdAt: now, updatedAt: now },
  { id: 7, content: "Please also add authentication examples in the docs.", author: users[0], taskId: 6, createdAt: now, updatedAt: now },
  { id: 8, content: "Pipeline is set up and running. Deploys to staging automatically on merge to develop branch.", author: users[2], taskId: 1, createdAt: now, updatedAt: now },
  { id: 9, content: "Great work! Can we add a Slack notification on deployment?", author: users[1], taskId: 1, createdAt: now, updatedAt: now }
];

let commentIdCounter = 10;

const notifications = [
  { id: 1, type: 'TASK_ASSIGNED', title: 'Task Assigned', message: 'You have been assigned to "Fix login redirect bug"', entityType: 'TASK', entityId: 4, read: false, createdAt: now },
  { id: 2, type: 'COMMENT_ADDED', title: 'New Comment', message: 'Sarah Martin commented on "Implement drag and drop"', entityType: 'TASK', entityId: 5, read: false, createdAt: now },
  { id: 3, type: 'TASK_STATUS_CHANGED', title: 'Task Updated', message: '"Write API documentation" moved to IN_REVIEW', entityType: 'TASK', entityId: 6, read: true, createdAt: now }
];

// ==================== AUTH ENDPOINTS ====================

let currentUser = users[0]; // default admin

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials', data: null, timestamp: now });
  const token = generateJWT(user);
  currentUser = user;
  res.json(apiSuccess({
    accessToken: token,
    refreshToken: 'mock-refresh-' + user.id,
    tokenType: 'Bearer',
    user
  }, 'Login successful'));
});

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const newUser = { id: users.length + 1, firstName, lastName, email, avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=2563EB&color=fff`, role: 'DEVELOPER', fullName: `${firstName} ${lastName}`, createdAt: now };
  users.push(newUser);
  currentUser = newUser;
  const token = generateJWT(newUser);
  res.status(201).json(apiSuccess({
    accessToken: token,
    refreshToken: 'mock-refresh-' + newUser.id,
    tokenType: 'Bearer',
    user: newUser
  }, 'Registration successful'));
});

app.post('/api/auth/refresh', (req, res) => {
  const token = generateJWT(currentUser);
  res.json(apiSuccess({
    accessToken: token,
    refreshToken: 'mock-refresh-' + currentUser.id,
    tokenType: 'Bearer',
    user: currentUser
  }, 'Token refreshed'));
});

app.get('/api/auth/me', (req, res) => {
  res.json(apiSuccess(currentUser));
});

// ==================== USER ENDPOINTS ====================

app.get('/api/users', (req, res) => {
  res.json(apiSuccess(users));
});

app.get('/api/users/me', (req, res) => {
  res.json(apiSuccess(currentUser));
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json(apiSuccess(user));
});

app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  Object.assign(user, req.body, { updatedAt: new Date().toISOString() });
  res.json(apiSuccess(user, 'User updated'));
});

// ==================== PROJECT ENDPOINTS ====================

app.get('/api/projects', (req, res) => {
  const status = req.query.status;
  let result = projects;
  if (status) result = projects.filter(p => p.status === status);
  res.json(apiSuccess(result));
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json(apiSuccess(project));
});

app.post('/api/projects', (req, res) => {
  const newProject = { id: projects.length + 1, ...req.body, owner: currentUser, members: [currentUser], createdAt: now, updatedAt: now, totalTasks: 0, completedTasks: 0, progressPercentage: 0 };
  projects.push(newProject);
  res.status(201).json(apiSuccess(newProject, 'Project created'));
});

app.put('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  Object.assign(project, req.body, { updatedAt: new Date().toISOString() });
  res.json(apiSuccess(project, 'Project updated'));
});

app.delete('/api/projects/:id', (req, res) => {
  const idx = projects.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Project not found' });
  projects.splice(idx, 1);
  res.json(apiSuccess(null, 'Project deleted'));
});

app.post('/api/projects/:id/members', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json(apiSuccess(project, 'Member added'));
});

app.delete('/api/projects/:projectId/members/:userId', (req, res) => {
  res.json(apiSuccess(null, 'Member removed'));
});

// ==================== TASK ENDPOINTS ====================

app.get('/api/tasks', (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 20;
  const start = page * size;
  const paged = tasks.slice(start, start + size);
  res.json(apiSuccess({ content: paged, totalElements: tasks.length, totalPages: Math.ceil(tasks.length / size), number: page, size }));
});

app.get('/api/tasks/my-tasks', (req, res) => {
  const myTasks = tasks.filter(t => t.assignee && t.assignee.id === currentUser.id);
  res.json(apiSuccess(myTasks));
});

app.get('/api/tasks/watched', (req, res) => {
  const watched = tasks.filter(t => t.watching);
  res.json(apiSuccess(watched));
});

app.get('/api/tasks/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const result = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
  res.json(apiSuccess(result));
});

app.get('/api/tasks/project/:projectId', (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  res.json(apiSuccess(projectTasks));
});

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  // Include comments
  task.comments = comments.filter(c => c.taskId === task.id);
  res.json(apiSuccess(task));
});

app.post('/api/tasks', (req, res) => {
  const project = projects.find(p => p.id === req.body.projectId);
  const newTask = {
    id: taskIdCounter++,
    taskKey: project ? `${project.key}-${String(tasks.filter(t => t.projectId === req.body.projectId).length + 1).padStart(3, '0')}` : `TASK-${taskIdCounter}`,
    ...req.body,
    projectName: project ? project.name : '',
    projectKey: project ? project.key : '',
    assignee: req.body.assigneeId ? users.find(u => u.id === req.body.assigneeId) : null,
    reporter: currentUser,
    subtasks: [],
    labels: [],
    watcherCount: 0,
    watching: false,
    comments: [],
    createdAt: now,
    updatedAt: now,
    overdue: false
  };
  tasks.push(newTask);
  res.status(201).json(apiSuccess(newTask, 'Task created'));
});

app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  Object.assign(task, req.body, { updatedAt: new Date().toISOString() });
  if (req.body.assigneeId) task.assignee = users.find(u => u.id === req.body.assigneeId) || null;
  res.json(apiSuccess(task, 'Task updated'));
});

app.patch('/api/tasks/:id/status', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  task.status = req.body.status;
  task.updatedAt = new Date().toISOString();
  res.json(apiSuccess(task, 'Task status updated'));
});

app.delete('/api/tasks/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Task not found' });
  tasks.splice(idx, 1);
  res.json(apiSuccess(null, 'Task deleted'));
});

app.post('/api/tasks/bulk', (req, res) => {
  res.json(apiSuccess(null, 'Bulk update completed'));
});

app.post('/api/tasks/:taskId/watchers', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.taskId));
  if (task) { task.watching = true; task.watcherCount++; }
  res.json(apiSuccess(null, 'Watching task'));
});

app.delete('/api/tasks/:taskId/watchers', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.taskId));
  if (task) { task.watching = false; task.watcherCount = Math.max(0, task.watcherCount - 1); }
  res.json(apiSuccess(null, 'Unwatched task'));
});

// ==================== COMMENT ENDPOINTS ====================

app.get('/api/tasks/:taskId/comments', (req, res) => {
  const taskComments = comments.filter(c => c.taskId === parseInt(req.params.taskId));
  res.json(apiSuccess(taskComments));
});

app.post('/api/tasks/:taskId/comments', (req, res) => {
  const newComment = {
    id: commentIdCounter++,
    content: req.body.content,
    author: currentUser,
    taskId: parseInt(req.params.taskId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  comments.push(newComment);
  res.status(201).json(apiSuccess(newComment, 'Comment added'));
});

app.put('/api/tasks/:taskId/comments/:commentId', (req, res) => {
  const comment = comments.find(c => c.id === parseInt(req.params.commentId));
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
  comment.content = req.body.content;
  comment.updatedAt = new Date().toISOString();
  res.json(apiSuccess(comment, 'Comment updated'));
});

app.delete('/api/tasks/:taskId/comments/:commentId', (req, res) => {
  const idx = comments.findIndex(c => c.id === parseInt(req.params.commentId));
  if (idx !== -1) comments.splice(idx, 1);
  res.json(apiSuccess(null, 'Comment deleted'));
});

// ==================== DASHBOARD ENDPOINTS ====================

app.get('/api/dashboard/stats', (req, res) => {
  const tasksByStatus = {};
  const tasksByPriority = {};
  tasks.forEach(t => {
    tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
    tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1;
  });
  res.json(apiSuccess({
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'DONE').length,
    overdueTasks: tasks.filter(t => t.overdue).length,
    tasksByStatus,
    tasksByPriority,
    recentTasks: tasks.slice(0, 5),
    projectProgress: projects
  }));
});

app.get('/api/dashboard/project/:projectId/stats', (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const tasksByStatus = {};
  const tasksByPriority = {};
  projectTasks.forEach(t => {
    tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
    tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1;
  });
  res.json(apiSuccess({
    totalProjects: 1,
    totalTasks: projectTasks.length,
    completedTasks: projectTasks.filter(t => t.status === 'DONE').length,
    overdueTasks: 0,
    tasksByStatus,
    tasksByPriority,
    recentTasks: projectTasks.slice(0, 5),
    projectProgress: projects.filter(p => p.id === projectId)
  }));
});

// ==================== SPRINT ENDPOINTS ====================

app.get('/api/sprints/project/:projectId', (req, res) => {
  const projectSprints = sprints.filter(s => s.projectId === parseInt(req.params.projectId));
  res.json(apiSuccess(projectSprints));
});

app.get('/api/sprints/:id', (req, res) => {
  const sprint = sprints.find(s => s.id === parseInt(req.params.id));
  if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });
  res.json(apiSuccess(sprint));
});

app.get('/api/sprints/:id/tasks', (req, res) => {
  const sprintTasks = tasks.filter(t => t.sprintId === parseInt(req.params.id));
  res.json(apiSuccess(sprintTasks));
});

app.get('/api/sprints/project/:projectId/backlog', (req, res) => {
  const backlog = tasks.filter(t => t.projectId === parseInt(req.params.projectId) && !t.sprintId);
  res.json(apiSuccess(backlog));
});

app.post('/api/sprints', (req, res) => {
  const newSprint = { id: sprints.length + 1, ...req.body, status: 'PLANNING', totalTasks: 0, completedTasks: 0, todoTasks: 0, inProgressTasks: 0, progressPercentage: 0, createdAt: now, updatedAt: now };
  sprints.push(newSprint);
  res.status(201).json(apiSuccess(newSprint, 'Sprint created'));
});

app.put('/api/sprints/:id', (req, res) => {
  const sprint = sprints.find(s => s.id === parseInt(req.params.id));
  if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });
  Object.assign(sprint, req.body, { updatedAt: new Date().toISOString() });
  res.json(apiSuccess(sprint, 'Sprint updated'));
});

app.patch('/api/sprints/:id/start', (req, res) => {
  const sprint = sprints.find(s => s.id === parseInt(req.params.id));
  if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });
  sprint.status = 'ACTIVE';
  res.json(apiSuccess(sprint, 'Sprint started'));
});

app.patch('/api/sprints/:id/complete', (req, res) => {
  const sprint = sprints.find(s => s.id === parseInt(req.params.id));
  if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });
  sprint.status = 'COMPLETED';
  res.json(apiSuccess(sprint, 'Sprint completed'));
});

app.post('/api/sprints/:sprintId/tasks/:taskId', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.taskId));
  if (task) { task.sprintId = parseInt(req.params.sprintId); }
  res.json(apiSuccess(null, 'Task added to sprint'));
});

app.delete('/api/sprints/:sprintId/tasks/:taskId', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.taskId));
  if (task) { task.sprintId = null; task.sprintName = null; }
  res.json(apiSuccess(null, 'Task removed from sprint'));
});

app.delete('/api/sprints/:id', (req, res) => {
  const idx = sprints.findIndex(s => s.id === parseInt(req.params.id));
  if (idx !== -1) sprints.splice(idx, 1);
  res.json(apiSuccess(null, 'Sprint deleted'));
});

// ==================== EPIC ENDPOINTS ====================

app.get('/api/epics/project/:projectId', (req, res) => {
  const projectEpics = epics.filter(e => e.projectId === parseInt(req.params.projectId));
  res.json(apiSuccess(projectEpics));
});

app.get('/api/epics/:id', (req, res) => {
  const epic = epics.find(e => e.id === parseInt(req.params.id));
  if (!epic) return res.status(404).json({ success: false, message: 'Epic not found' });
  res.json(apiSuccess(epic));
});

app.post('/api/epics', (req, res) => {
  const newEpic = { id: epics.length + 1, ...req.body, totalTasks: 0, completedTasks: 0, progressPercentage: 0, createdAt: now, updatedAt: now };
  epics.push(newEpic);
  res.status(201).json(apiSuccess(newEpic, 'Epic created'));
});

app.put('/api/epics/:id', (req, res) => {
  const epic = epics.find(e => e.id === parseInt(req.params.id));
  if (!epic) return res.status(404).json({ success: false, message: 'Epic not found' });
  Object.assign(epic, req.body, { updatedAt: new Date().toISOString() });
  res.json(apiSuccess(epic, 'Epic updated'));
});

app.delete('/api/epics/:id', (req, res) => {
  const idx = epics.findIndex(e => e.id === parseInt(req.params.id));
  if (idx !== -1) epics.splice(idx, 1);
  res.json(apiSuccess(null, 'Epic deleted'));
});

// ==================== NOTIFICATION ENDPOINTS ====================

app.get('/api/notifications', (req, res) => {
  res.json(apiSuccess(notifications));
});

app.get('/api/notifications/unread-count', (req, res) => {
  res.json(apiSuccess(notifications.filter(n => !n.read).length));
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === parseInt(req.params.id));
  if (notif) notif.read = true;
  res.json(apiSuccess(null, 'Notification marked as read'));
});

app.patch('/api/notifications/read-all', (req, res) => {
  notifications.forEach(n => n.read = true);
  res.json(apiSuccess(null, 'All notifications marked as read'));
});

// ==================== ACTIVITY LOG ENDPOINTS ====================

app.get('/api/activities', (req, res) => {
  res.json(apiSuccess([
    { id: 1, action: 'CREATED', entityType: 'TASK', entityId: 4, entityName: 'Fix login redirect bug', user: users[1], projectId: 1, projectName: 'TaskFlow Platform', createdAt: now },
    { id: 2, action: 'STATUS_CHANGED', entityType: 'TASK', entityId: 6, entityName: 'Write API documentation', user: users[2], projectId: 1, projectName: 'TaskFlow Platform', details: 'IN_PROGRESS -> IN_REVIEW', createdAt: now },
    { id: 3, action: 'COMMENT_ADDED', entityType: 'TASK', entityId: 5, entityName: 'Implement drag and drop', user: users[3], projectId: 1, projectName: 'TaskFlow Platform', createdAt: now }
  ]));
});

app.get('/api/activities/project/:projectId', (req, res) => {
  res.json(apiSuccess([]));
});

// ==================== LABEL ENDPOINTS ====================

app.get('/api/labels/project/:projectId', (req, res) => {
  res.json(apiSuccess([
    { id: 1, name: 'Bug', color: '#EF4444', projectId: parseInt(req.params.projectId), createdAt: now },
    { id: 2, name: 'Feature', color: '#10B981', projectId: parseInt(req.params.projectId), createdAt: now },
    { id: 3, name: 'Enhancement', color: '#6366F1', projectId: parseInt(req.params.projectId), createdAt: now },
    { id: 4, name: 'Documentation', color: '#F59E0B', projectId: parseInt(req.params.projectId), createdAt: now }
  ]));
});

app.post('/api/labels', (req, res) => {
  res.status(201).json(apiSuccess({ id: Date.now(), ...req.body, createdAt: now }, 'Label created'));
});

app.put('/api/labels/:id', (req, res) => {
  res.json(apiSuccess({ id: parseInt(req.params.id), ...req.body }, 'Label updated'));
});

app.delete('/api/labels/:id', (req, res) => {
  res.json(apiSuccess(null, 'Label deleted'));
});

// ==================== AUTOMATION ENDPOINTS ====================

app.get('/api/automations/project/:projectId', (req, res) => {
  res.json(apiSuccess([
    { id: 1, name: 'Auto-assign on status change', description: 'Assign task to reviewer when moved to IN_REVIEW', projectId: parseInt(req.params.projectId), enabled: true, triggerType: 'STATUS_CHANGE', actionType: 'ASSIGN_USER', createdAt: now },
    { id: 2, name: 'Notify on overdue', description: 'Send notification when task is overdue', projectId: parseInt(req.params.projectId), enabled: false, triggerType: 'DUE_DATE_PASSED', actionType: 'SEND_NOTIFICATION', createdAt: now }
  ]));
});

app.post('/api/automations', (req, res) => {
  res.status(201).json(apiSuccess({ id: Date.now(), ...req.body, createdAt: now }, 'Automation created'));
});

app.put('/api/automations/:id', (req, res) => {
  res.json(apiSuccess({ id: parseInt(req.params.id), ...req.body }, 'Automation updated'));
});

app.patch('/api/automations/:id/toggle', (req, res) => {
  res.json(apiSuccess({ id: parseInt(req.params.id), enabled: true }, 'Automation toggled'));
});

app.delete('/api/automations/:id', (req, res) => {
  res.json(apiSuccess(null, 'Automation deleted'));
});

// ==================== REPORT ENDPOINTS ====================

app.get('/api/reports/sprint/:sprintId', (req, res) => {
  const sprint = sprints.find(s => s.id === parseInt(req.params.sprintId));
  const sprintTasks = tasks.filter(t => t.sprintId === parseInt(req.params.sprintId));
  res.json(apiSuccess({
    sprint,
    totalTasks: sprintTasks.length,
    completedTasks: sprintTasks.filter(t => t.status === 'DONE').length,
    tasksByStatus: { TODO: sprintTasks.filter(t => t.status === 'TODO').length, IN_PROGRESS: sprintTasks.filter(t => t.status === 'IN_PROGRESS').length, IN_REVIEW: sprintTasks.filter(t => t.status === 'IN_REVIEW').length, DONE: sprintTasks.filter(t => t.status === 'DONE').length },
    burndownData: [],
    velocityPoints: sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  }));
});

app.get('/api/reports/velocity/:projectId', (req, res) => {
  res.json(apiSuccess({ sprints: sprints.filter(s => s.projectId === parseInt(req.params.projectId)).map(s => ({ sprintName: s.name, committedPoints: 20, completedPoints: s.status === 'COMPLETED' ? 18 : 8 })) }));
});

// ==================== ATTACHMENT ENDPOINTS ====================

app.get('/api/attachments/task/:taskId', (req, res) => {
  res.json(apiSuccess([]));
});

app.post('/api/attachments/task/:taskId', (req, res) => {
  res.status(201).json(apiSuccess({ id: Date.now(), fileName: 'uploaded-file.txt', fileSize: 1024, contentType: 'text/plain', taskId: parseInt(req.params.taskId), createdAt: now }, 'File uploaded'));
});

app.delete('/api/attachments/:id', (req, res) => {
  res.json(apiSuccess(null, 'Attachment deleted'));
});

// ==================== TASK LINKS ====================

app.get('/api/task-links/task/:taskId', (req, res) => {
  res.json(apiSuccess([]));
});

app.post('/api/task-links', (req, res) => {
  res.status(201).json(apiSuccess({ id: Date.now(), ...req.body, createdAt: now }, 'Task link created'));
});

app.delete('/api/task-links/:id', (req, res) => {
  res.json(apiSuccess(null, 'Task link deleted'));
});

// ==================== SAVED FILTERS ====================

app.get('/api/filters/project/:projectId', (req, res) => {
  res.json(apiSuccess([]));
});

app.post('/api/filters', (req, res) => {
  res.status(201).json(apiSuccess({ id: Date.now(), ...req.body, createdAt: now }, 'Filter saved'));
});

app.delete('/api/filters/:id', (req, res) => {
  res.json(apiSuccess(null, 'Filter deleted'));
});

// ==================== EXPORT ====================

app.get('/api/export/tasks/csv', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
  res.send('Key,Title,Status,Priority,Assignee\n' + tasks.map(t => `${t.taskKey},${t.title},${t.status},${t.priority},${t.assignee ? t.assignee.fullName : 'Unassigned'}`).join('\n'));
});

app.get('/api/export/projects/:projectId/tasks/csv', (req, res) => {
  const projectTasks = tasks.filter(t => t.projectId === parseInt(req.params.projectId));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
  res.send('Key,Title,Status,Priority,Assignee\n' + projectTasks.map(t => `${t.taskKey},${t.title},${t.status},${t.priority},${t.assignee ? t.assignee.fullName : 'Unassigned'}`).join('\n'));
});

// ==================== WEBSOCKET STUB ====================

app.get('/ws/**', (req, res) => {
  res.json({ message: 'WebSocket endpoint - use ws:// protocol' });
});

// ==================== CATCH ALL ====================

app.all('/api/*', (req, res) => {
  console.log(`[MOCK] Unhandled: ${req.method} ${req.url}`);
  res.json(apiSuccess([]));
});

// ==================== START SERVER ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==============================================`);
  console.log(`  TaskFlow Mock Backend running on port ${PORT}`);
  console.log(`==============================================`);
  console.log(`  API:       http://localhost:${PORT}/api`);
  console.log(`  Frontend:  http://localhost:4200`);
  console.log(`\n  Demo accounts (password: password123):`);
  console.log(`    - admin@taskflow.com   (Admin)`);
  console.log(`    - sarah@taskflow.com   (Project Manager)`);
  console.log(`    - thomas@taskflow.com  (Developer)`);
  console.log(`    - marie@taskflow.com   (Developer)`);
  console.log(`==============================================\n`);
});
