package com.taskflow.config;

import com.taskflow.entity.*;
import com.taskflow.enums.*;
import com.taskflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final SprintRepository sprintRepository;
    private final EpicRepository epicRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initialization.");
            return;
        }

        log.info("Seeding database with demo data...");

        // Create Users
        User admin = userRepository.save(User.builder()
                .firstName("Admin").lastName("User")
                .email("admin@taskflow.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ADMIN)
                .avatar("https://ui-avatars.com/api/?name=Admin+User&background=2563EB&color=fff")
                .build());

        User sarah = userRepository.save(User.builder()
                .firstName("Sarah").lastName("Martin")
                .email("sarah@taskflow.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.PROJECT_MANAGER)
                .avatar("https://ui-avatars.com/api/?name=Sarah+Martin&background=7C3AED&color=fff")
                .build());

        User thomas = userRepository.save(User.builder()
                .firstName("Thomas").lastName("Dubois")
                .email("thomas@taskflow.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.DEVELOPER)
                .avatar("https://ui-avatars.com/api/?name=Thomas+Dubois&background=10B981&color=fff")
                .build());

        User marie = userRepository.save(User.builder()
                .firstName("Marie").lastName("Laurent")
                .email("marie@taskflow.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.DEVELOPER)
                .avatar("https://ui-avatars.com/api/?name=Marie+Laurent&background=F59E0B&color=fff")
                .build());

        log.info("Created 4 users");

        // Create Projects
        Project taskflow = Project.builder()
                .name("TaskFlow Platform").description("Main project management platform with kanban boards, dashboards, and team collaboration features.")
                .key("TF").status(ProjectStatus.ACTIVE).owner(sarah)
                .members(Set.of(admin, sarah, thomas, marie))
                .startDate(LocalDate.now().minusMonths(2)).endDate(LocalDate.now().plusMonths(4))
                .build();
        taskflow.setTaskSequence(0);
        taskflow = projectRepository.save(taskflow);

        Project mobileApp = Project.builder()
                .name("Mobile App v2").description("Second version of the mobile application with improved UX and offline capabilities.")
                .key("MA").status(ProjectStatus.ACTIVE).owner(sarah)
                .members(Set.of(sarah, thomas, marie))
                .startDate(LocalDate.now().minusWeeks(3)).endDate(LocalDate.now().plusMonths(3))
                .build();
        mobileApp.setTaskSequence(0);
        mobileApp = projectRepository.save(mobileApp);

        Project apiMigration = Project.builder()
                .name("API Migration").description("Migrating legacy REST API to modern GraphQL architecture.")
                .key("AM").status(ProjectStatus.COMPLETED).owner(admin)
                .members(Set.of(admin, thomas))
                .startDate(LocalDate.now().minusMonths(4)).endDate(LocalDate.now().minusWeeks(1))
                .build();
        apiMigration.setTaskSequence(0);
        apiMigration = projectRepository.save(apiMigration);

        log.info("Created 3 projects");

        // Create Epics for TaskFlow
        Epic authEpic = epicRepository.save(Epic.builder()
                .name("Authentication & Security").description("All authentication and security related features")
                .color("#EF4444").project(taskflow).build());

        Epic uiEpic = epicRepository.save(Epic.builder()
                .name("User Interface").description("UI/UX design and frontend implementation")
                .color("#6366F1").project(taskflow).build());

        Epic infraEpic = epicRepository.save(Epic.builder()
                .name("Infrastructure").description("DevOps, CI/CD, and infrastructure tasks")
                .color("#10B981").project(taskflow).build());

        // Create Epics for Mobile App
        Epic mobileUxEpic = epicRepository.save(Epic.builder()
                .name("Mobile UX").description("User experience improvements for mobile")
                .color("#F59E0B").project(mobileApp).build());

        Epic mobileSecEpic = epicRepository.save(Epic.builder()
                .name("Mobile Security").description("Security features for mobile app")
                .color("#8B5CF6").project(mobileApp).build());

        log.info("Created 5 epics");

        // Create Sprints for TaskFlow
        Sprint tfSprint1 = sprintRepository.save(Sprint.builder()
                .name("Sprint 1 - Foundation").goal("Setup core infrastructure and authentication")
                .project(taskflow).status(SprintStatus.COMPLETED)
                .startDate(LocalDate.now().minusWeeks(4)).endDate(LocalDate.now().minusWeeks(2))
                .build());

        Sprint tfSprint2 = sprintRepository.save(Sprint.builder()
                .name("Sprint 2 - Core Features").goal("Implement kanban board and task management")
                .project(taskflow).status(SprintStatus.ACTIVE)
                .startDate(LocalDate.now().minusWeeks(2)).endDate(LocalDate.now().plusWeeks(1))
                .build());

        Sprint tfSprint3 = sprintRepository.save(Sprint.builder()
                .name("Sprint 3 - Polish").goal("Documentation, notifications, and UI improvements")
                .project(taskflow).status(SprintStatus.PLANNING)
                .startDate(LocalDate.now().plusWeeks(1)).endDate(LocalDate.now().plusWeeks(3))
                .build());

        // Create Sprint for Mobile App
        Sprint maSprint1 = sprintRepository.save(Sprint.builder()
                .name("Sprint 1 - Mobile Core").goal("Navigation and offline mode")
                .project(mobileApp).status(SprintStatus.ACTIVE)
                .startDate(LocalDate.now().minusWeeks(1)).endDate(LocalDate.now().plusWeeks(2))
                .build());

        log.info("Created 4 sprints");

        // TaskFlow Platform tasks (with epics and sprints)
        createTask(taskflow, "Setup CI/CD pipeline", "Configure GitHub Actions for automated testing and deployment.", TaskStatus.DONE, TaskPriority.HIGH, thomas, sarah, LocalDate.now().minusDays(10), 8.0, 10.0, List.of("devops", "automation"), tfSprint1, infraEpic, null);
        createTask(taskflow, "Design user dashboard", "Create wireframes and mockups for the main dashboard.", TaskStatus.DONE, TaskPriority.HIGH, marie, sarah, LocalDate.now().minusDays(5), 12.0, 14.0, List.of("design", "ui"), tfSprint1, uiEpic, null);
        createTask(taskflow, "Implement authentication system", "Build JWT-based authentication with login, register, and RBAC.", TaskStatus.DONE, TaskPriority.CRITICAL, thomas, sarah, LocalDate.now().minusDays(15), 16.0, 18.0, List.of("security", "backend"), tfSprint1, authEpic, null);
        createTask(taskflow, "Fix login redirect bug", "Users not redirected after login. Check auth guard.", TaskStatus.IN_PROGRESS, TaskPriority.HIGH, thomas, sarah, LocalDate.now().plusDays(2), 3.0, 1.5, List.of("bug", "auth"), tfSprint2, authEpic, null);
        createTask(taskflow, "Implement drag and drop", "Add drag and drop to kanban board with smooth animations.", TaskStatus.IN_PROGRESS, TaskPriority.CRITICAL, marie, sarah, LocalDate.now().plusDays(5), 10.0, 4.0, List.of("frontend", "feature"), tfSprint2, uiEpic, null);
        createTask(taskflow, "Write API documentation", "Document all REST API endpoints using Swagger/OpenAPI.", TaskStatus.IN_REVIEW, TaskPriority.MEDIUM, thomas, sarah, LocalDate.now().plusDays(1), 6.0, 5.0, List.of("docs", "api"), tfSprint2, null, null);
        createTask(taskflow, "Add email notifications", "Implement email notifications for task assignments and status changes.", TaskStatus.TODO, TaskPriority.MEDIUM, null, sarah, LocalDate.now().plusDays(14), 12.0, 0.0, List.of("feature", "notifications"), tfSprint3, null, null);
        createTask(taskflow, "Optimize database queries", "Review and optimize slow queries. Add proper indexing.", TaskStatus.TODO, TaskPriority.HIGH, thomas, sarah, LocalDate.now().plusDays(7), 8.0, 0.0, List.of("backend", "performance"), tfSprint3, infraEpic, null);
        createTask(taskflow, "Create onboarding flow", "Design guided onboarding with tooltips and welcome wizard.", TaskStatus.TODO, TaskPriority.LOW, marie, sarah, LocalDate.now().plusDays(21), 10.0, 0.0, List.of("ux", "feature"), null, uiEpic, null);
        createTask(taskflow, "Add dark mode support", "Implement dark mode toggle with system preference detection.", TaskStatus.TODO, TaskPriority.LOW, null, sarah, LocalDate.now().plusDays(30), 8.0, 0.0, List.of("frontend", "ui"), null, uiEpic, null);

        // Mobile App v2 tasks
        createTask(mobileApp, "Design app navigation", "Create bottom tab navigation with animations.", TaskStatus.DONE, TaskPriority.HIGH, marie, sarah, LocalDate.now().minusDays(7), 6.0, 7.0, List.of("design", "mobile"), maSprint1, mobileUxEpic, null);
        createTask(mobileApp, "Implement offline mode", "Add offline persistence using SQLite and sync mechanism.", TaskStatus.IN_PROGRESS, TaskPriority.CRITICAL, thomas, sarah, LocalDate.now().plusDays(10), 20.0, 8.0, List.of("mobile", "feature"), maSprint1, mobileUxEpic, null);
        createTask(mobileApp, "Push notification service", "Integrate Firebase Cloud Messaging.", TaskStatus.TODO, TaskPriority.HIGH, thomas, sarah, LocalDate.now().plusDays(15), 10.0, 0.0, List.of("mobile", "notifications"), null, null, null);
        createTask(mobileApp, "Performance optimization", "Reduce startup time and optimize list rendering.", TaskStatus.IN_REVIEW, TaskPriority.MEDIUM, marie, sarah, LocalDate.now().plusDays(3), 8.0, 6.0, List.of("performance", "mobile"), maSprint1, mobileUxEpic, null);
        createTask(mobileApp, "Biometric authentication", "Add fingerprint and Face ID authentication.", TaskStatus.TODO, TaskPriority.MEDIUM, null, sarah, LocalDate.now().plusDays(20), 6.0, 0.0, List.of("security", "mobile"), null, mobileSecEpic, null);

        // API Migration tasks
        createTask(apiMigration, "Define GraphQL schema", "Create complete GraphQL schema with types and mutations.", TaskStatus.DONE, TaskPriority.CRITICAL, thomas, admin, LocalDate.now().minusDays(30), 12.0, 14.0, List.of("graphql", "backend"), null, null, null);
        createTask(apiMigration, "Migrate user endpoints", "Migrate REST endpoints to GraphQL resolvers.", TaskStatus.DONE, TaskPriority.HIGH, thomas, admin, LocalDate.now().minusDays(20), 8.0, 9.0, List.of("migration", "backend"), null, null, null);
        createTask(apiMigration, "Migration testing", "Comprehensive testing of all migrated endpoints.", TaskStatus.DONE, TaskPriority.HIGH, thomas, admin, LocalDate.now().minusDays(10), 10.0, 12.0, List.of("testing", "qa"), null, null, null);

        log.info("Created 18 tasks");

        // Create some subtasks for "Implement drag and drop"
        List<Task> tasks = taskRepository.findAll();
        Task dragDropTask = tasks.stream().filter(t -> t.getTitle().contains("drag and drop")).findFirst().orElse(null);
        if (dragDropTask != null) {
            createTask(taskflow, "Setup CDK drag module", "Install and configure Angular CDK Drag & Drop module.", TaskStatus.DONE, TaskPriority.MEDIUM, marie, sarah, LocalDate.now().plusDays(3), 2.0, 2.0, List.of("frontend"), tfSprint2, uiEpic, dragDropTask);
            createTask(taskflow, "Implement column drop zones", "Create drop zones for each kanban column.", TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, marie, sarah, LocalDate.now().plusDays(4), 4.0, 2.0, List.of("frontend"), tfSprint2, uiEpic, dragDropTask);
            createTask(taskflow, "Add drag animations", "Add smooth animations during drag operations.", TaskStatus.TODO, TaskPriority.LOW, marie, sarah, LocalDate.now().plusDays(5), 3.0, 0.0, List.of("frontend", "animation"), tfSprint2, uiEpic, dragDropTask);
        }

        log.info("Created 3 subtasks");

        // Create Comments
        Task fixLoginTask = tasks.stream().filter(t -> t.getTitle().contains("Fix login")).findFirst().orElse(null);
        Task apiDocTask = tasks.stream().filter(t -> t.getTitle().contains("API documentation")).findFirst().orElse(null);
        Task cicdTask = tasks.stream().filter(t -> t.getTitle().contains("CI/CD")).findFirst().orElse(null);

        if (fixLoginTask != null) {
            createComment(fixLoginTask, thomas, "I've started investigating this. It seems like the auth guard is not properly checking the token expiration.");
            createComment(fixLoginTask, sarah, "Can we prioritize this? It's affecting the demo scheduled for next week.");
            createComment(fixLoginTask, thomas, "Found the issue - the redirect URL was being lost during the OAuth flow. Working on a fix now.");
        }
        if (dragDropTask != null) {
            createComment(dragDropTask, marie, "I'm using Angular CDK Drag & Drop for this. The basic functionality is working, now adding animations.");
            createComment(dragDropTask, sarah, "Looks great so far! Can you also add a visual indicator when hovering over a column?");
        }
        if (apiDocTask != null) {
            createComment(apiDocTask, thomas, "PR submitted for review. I've documented all 25 endpoints with request/response examples.");
            createComment(apiDocTask, admin, "Please also add authentication examples in the docs.");
        }
        if (cicdTask != null) {
            createComment(cicdTask, thomas, "Pipeline is set up and running. Deploys to staging automatically on merge to develop branch.");
            createComment(cicdTask, sarah, "Great work! Can we add a Slack notification on deployment?");
        }

        log.info("Created comments");
        log.info("Database seeding completed successfully!");
    }

    private void createTask(Project project, String title, String description, TaskStatus status,
                             TaskPriority priority, User assignee, User reporter, LocalDate dueDate,
                             Double estimatedHours, Double loggedHours, List<String> tags,
                             Sprint sprint, Epic epic, Task parentTask) {
        int seq = project.getNextTaskSequence();
        String taskKey = project.getKey() + "-" + String.format("%03d", seq);
        Task task = Task.builder()
                .taskKey(taskKey).title(title).description(description)
                .status(status).priority(priority).project(project)
                .assignee(assignee).reporter(reporter).dueDate(dueDate)
                .estimatedHours(estimatedHours).loggedHours(loggedHours).tags(tags)
                .sprint(sprint).epic(epic).parentTask(parentTask)
                .build();
        taskRepository.save(task);
        projectRepository.save(project);
    }

    private void createComment(Task task, User author, String content) {
        commentRepository.save(Comment.builder()
                .content(content).task(task).author(author).build());
    }
}
