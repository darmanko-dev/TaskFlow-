# TaskFlow - Project Management Platform

```
 _____         _    _____ _
|_   _|_ _ ___| | _|  ___| | _____      __
  | |/ _` / __| |/ / |_  | |/ _ \ \ /\ / /
  | | (_| \__ \   <|  _| | | (_) \ V  V /
  |_|\__,_|___/_|\_\_|   |_|\___/ \_/\_/
```

A powerful, full-stack project management platform inspired by Jira. Built with **Spring Boot** and **Angular**, featuring Kanban boards, real-time dashboards, team collaboration, and more.

![Java](https://img.shields.io/badge/Java-17+-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?style=flat-square&logo=springboot)
![Angular](https://img.shields.io/badge/Angular-17-red?style=flat-square&logo=angular)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-blue?style=flat-square&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## Features

- **Authentication** - JWT-based auth with access/refresh tokens, role-based access control
- **Dashboard** - Interactive charts (Chart.js), stats cards, recent activity, project progress
- **Projects** - Create, edit, archive projects with team member management
- **Kanban Board** - Drag & drop task management across TODO, IN PROGRESS, IN REVIEW, DONE columns
- **Task Management** - Full CRUD with filtering, search, priority/status badges
- **Comments** - Real-time commenting on tasks with user avatars
- **Responsive Design** - Collapsible sidebar, mobile-friendly layout
- **Toast Notifications** - Success/error feedback on all actions

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17+ | Language |
| Spring Boot 3.2 | Framework |
| Spring Security 6 | Authentication & Authorization |
| Spring Data JPA | Data Access |
| PostgreSQL / H2 | Database |
| JWT (jjwt) | Token-based Auth |
| MapStruct | DTO Mapping |
| Lombok | Boilerplate Reduction |
| SpringDoc OpenAPI | API Documentation |

### Frontend
| Technology | Purpose |
|---|---|
| Angular 17 | Frontend Framework |
| Tailwind CSS 3 | Styling |
| Angular CDK | Drag & Drop |
| Chart.js / ng2-charts | Dashboard Charts |
| RxJS | Reactive Programming |
| Font Awesome | Icons |

## Prerequisites

- **Java 17+** (JDK)
- **Node.js 18+** and **npm**
- **PostgreSQL 15+** (or use H2 in dev mode)
- **Angular CLI** (`npm install -g @angular/cli`)
- **Maven 3.8+** (or use included wrapper)

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd TaskFlow-
```

### 2. Backend Setup

```bash
cd backend

# Run with H2 in-memory database (dev mode - default)
./mvnw spring-boot:run

# OR with PostgreSQL
# First create the database:
# createdb taskflow
# Then run with postgres profile:
./mvnw spring-boot:run -Dspring.profiles.active=default
```

The API will be available at `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
```

The app will be available at `http://localhost:4200`

### 4. Access the Application

Open `http://localhost:4200` in your browser.

## Demo Accounts

| Email | Password | Role |
|---|---|---|
| admin@taskflow.com | password123 | Admin |
| sarah@taskflow.com | password123 | Project Manager |
| thomas@taskflow.com | password123 | Developer |
| marie@taskflow.com | password123 | Developer |

## API Documentation

Swagger UI is available at: `http://localhost:8080/swagger-ui.html`

### API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| **Auth** | | |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| **Users** | | |
| GET | `/api/users` | List users |
| GET | `/api/users/me` | Current user profile |
| PUT | `/api/users/{id}` | Update profile |
| **Projects** | | |
| GET | `/api/projects` | List user projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}` | Project details |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |
| POST | `/api/projects/{id}/members` | Add member |
| DELETE | `/api/projects/{id}/members/{userId}` | Remove member |
| **Tasks** | | |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/{id}` | Task details |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/status` | Update status (drag & drop) |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/tasks/project/{id}` | Tasks by project |
| GET | `/api/tasks/my-tasks` | My assigned tasks |
| GET | `/api/tasks/search` | Search tasks |
| **Comments** | | |
| GET | `/api/tasks/{id}/comments` | List comments |
| POST | `/api/tasks/{id}/comments` | Add comment |
| PUT | `/api/tasks/{id}/comments/{cid}` | Update comment |
| DELETE | `/api/tasks/{id}/comments/{cid}` | Delete comment |
| **Dashboard** | | |
| GET | `/api/dashboard/stats` | Global statistics |
| GET | `/api/dashboard/project/{id}/stats` | Project statistics |

## Project Architecture

```
TaskFlow-/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/taskflow/
│   │   ├── config/             # Security, CORS, Swagger, JWT config
│   │   ├── security/           # JWT provider, filter, entry point
│   │   ├── controller/         # REST controllers
│   │   ├── service/            # Business logic
│   │   ├── repository/         # Data access layer
│   │   ├── entity/             # JPA entities
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── mapper/             # MapStruct mappers
│   │   ├── exception/          # Global exception handling
│   │   └── enums/              # Status, Priority, Role enums
│   └── src/main/resources/
│       ├── application.yml     # Main config
│       └── application-dev.yml # Dev profile (H2)
├── frontend/                   # Angular 17 SPA
│   └── src/app/
│       ├── core/               # Services, guards, interceptors, models
│       ├── shared/             # Reusable components, pipes, directives
│       ├── features/           # Feature modules
│       │   ├── auth/           # Login, Register
│       │   ├── dashboard/      # Stats, charts
│       │   ├── projects/       # CRUD, members
│       │   ├── tasks/          # Kanban, list, detail
│       │   └── profile/        # User profile
│       └── layouts/            # Auth & Main layouts
└── README.md
```

## Environment Variables

### Backend (`application.yml`)

| Variable | Default | Description |
|---|---|---|
| `spring.datasource.url` | `jdbc:h2:mem:taskflow` | Database URL |
| `spring.datasource.username` | `sa` | Database username |
| `spring.datasource.password` | - | Database password |
| `jwt.secret` | (configured) | JWT signing secret |
| `jwt.access-expiration` | `86400000` (24h) | Access token TTL |
| `jwt.refresh-expiration` | `604800000` (7d) | Refresh token TTL |

### Frontend (`environment.ts`)

| Variable | Default | Description |
|---|---|---|
| `apiUrl` | `http://localhost:8080/api` | Backend API URL |

## License

This project is licensed under the MIT License.
