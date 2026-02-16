package com.taskflow.service;

import com.taskflow.entity.*;
import com.taskflow.enums.TaskPriority;
import com.taskflow.enums.TaskStatus;
import com.taskflow.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExportServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private ExportService exportService;

    private Project project;
    private User reporter;
    private User assignee;
    private Sprint sprint;
    private Epic epic;
    private Task task1;
    private Task task2;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .name("Test Project")
                .key("TP")
                .build();

        reporter = User.builder()
                .id(10L)
                .firstName("Alice")
                .lastName("Johnson")
                .build();

        assignee = User.builder()
                .id(20L)
                .firstName("Bob")
                .lastName("Smith")
                .build();

        sprint = Sprint.builder()
                .id(1L)
                .name("Sprint 1")
                .build();

        epic = Epic.builder()
                .id(1L)
                .name("Epic Alpha")
                .build();

        task1 = Task.builder()
                .id(100L)
                .taskKey("TP-1")
                .title("First Task")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.HIGH)
                .project(project)
                .assignee(assignee)
                .reporter(reporter)
                .sprint(sprint)
                .epic(epic)
                .storyPoints(5)
                .dueDate(LocalDate.of(2025, 6, 15))
                .estimatedHours(8.0)
                .loggedHours(3.5)
                .createdAt(LocalDateTime.of(2025, 1, 10, 14, 30))
                .build();

        task2 = Task.builder()
                .id(101L)
                .taskKey("TP-2")
                .title("Second Task")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.LOW)
                .project(project)
                .assignee(null)
                .reporter(reporter)
                .sprint(null)
                .epic(null)
                .storyPoints(null)
                .dueDate(null)
                .estimatedHours(0.0)
                .loggedHours(0.0)
                .createdAt(LocalDateTime.of(2025, 2, 20, 9, 0))
                .build();
    }

    @Nested
    @DisplayName("exportTasksToCSV (project export)")
    class ExportProjectTasksCsv {

        @Test
        @DisplayName("should export tasks with correct CSV header")
        void shouldExportWithCorrectHeader() {
            when(taskRepository.findByProjectIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(task1));

            byte[] result = exportService.exportTasksToCSV(1L);
            String csv = new String(result, StandardCharsets.UTF_8);

            String[] lines = csv.split("\\r?\\n");
            assertThat(lines[0]).isEqualTo(
                    "Key,Title,Status,Priority,Assignee,Reporter,Sprint,Epic,Story Points,Due Date,Estimated Hours,Logged Hours,Created At");
            verify(taskRepository).findByProjectIdOrderByCreatedAtDesc(1L);
        }

        @Test
        @DisplayName("should export task data with all fields populated")
        void shouldExportTaskDataWithAllFields() {
            when(taskRepository.findByProjectIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(task1));

            byte[] result = exportService.exportTasksToCSV(1L);
            String csv = new String(result, StandardCharsets.UTF_8);

            String[] lines = csv.split("\\r?\\n");
            assertThat(lines).hasSize(2); // header + 1 data row

            String dataLine = lines[1];
            assertThat(dataLine).contains("\"TP-1\"");
            assertThat(dataLine).contains("\"First Task\"");
            assertThat(dataLine).contains("\"IN_PROGRESS\"");
            assertThat(dataLine).contains("\"HIGH\"");
            assertThat(dataLine).contains("\"Bob Smith\"");
            assertThat(dataLine).contains("\"Alice Johnson\"");
            assertThat(dataLine).contains("\"Sprint 1\"");
            assertThat(dataLine).contains("\"Epic Alpha\"");
            assertThat(dataLine).contains("5");
            assertThat(dataLine).contains("\"2025-06-15\"");
            assertThat(dataLine).contains("8.0");
            assertThat(dataLine).contains("3.5");
            assertThat(dataLine).contains("\"2025-01-10 14:30\"");
        }

        @Test
        @DisplayName("should handle tasks with null optional fields")
        void shouldHandleTasksWithNullOptionalFields() {
            when(taskRepository.findByProjectIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(task2));

            byte[] result = exportService.exportTasksToCSV(1L);
            String csv = new String(result, StandardCharsets.UTF_8);

            String[] lines = csv.split("\\r?\\n");
            assertThat(lines).hasSize(2);

            String dataLine = lines[1];
            assertThat(dataLine).contains("\"TP-2\"");
            assertThat(dataLine).contains("\"Second Task\"");
            assertThat(dataLine).contains("\"TODO\"");
            assertThat(dataLine).contains("\"LOW\"");
            // Null assignee should produce empty string
            assertThat(dataLine).contains("\"Alice Johnson\"");
            // Null sprint and epic should produce empty strings
            // storyPoints null should default to 0
            assertThat(dataLine).contains("0");
        }

        @Test
        @DisplayName("should export multiple tasks in correct order")
        void shouldExportMultipleTasks() {
            when(taskRepository.findByProjectIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(task1, task2));

            byte[] result = exportService.exportTasksToCSV(1L);
            String csv = new String(result, StandardCharsets.UTF_8);

            String[] lines = csv.split("\\r?\\n");
            assertThat(lines).hasSize(3); // header + 2 data rows
            assertThat(lines[1]).contains("\"TP-1\"");
            assertThat(lines[2]).contains("\"TP-2\"");
        }

        @Test
        @DisplayName("should return only header when no tasks exist")
        void shouldReturnOnlyHeaderWhenNoTasks() {
            when(taskRepository.findByProjectIdOrderByCreatedAtDesc(1L))
                    .thenReturn(Collections.emptyList());

            byte[] result = exportService.exportTasksToCSV(1L);
            String csv = new String(result, StandardCharsets.UTF_8);

            String[] lines = csv.trim().split("\\r?\\n");
            assertThat(lines).hasSize(1);
            assertThat(lines[0]).startsWith("Key,Title,Status");
        }

        @Test
        @DisplayName("should escape double quotes in task fields")
        void shouldEscapeDoubleQuotesInFields() {
            task1.setTitle("Task with \"quotes\" inside");
            when(taskRepository.findByProjectIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(task1));

            byte[] result = exportService.exportTasksToCSV(1L);
            String csv = new String(result, StandardCharsets.UTF_8);

            // The escape method replaces " with "" for CSV
            assertThat(csv).contains("Task with \"\"quotes\"\" inside");
        }
    }

    @Nested
    @DisplayName("exportAllTasksToCSV")
    class ExportAllTasksCsv {

        @Test
        @DisplayName("should export all tasks with correct header including Project column")
        void shouldExportWithProjectColumn() {
            when(taskRepository.findAll()).thenReturn(List.of(task1));

            byte[] result = exportService.exportAllTasksToCSV();
            String csv = new String(result, StandardCharsets.UTF_8);

            String[] lines = csv.split("\\r?\\n");
            assertThat(lines[0]).isEqualTo(
                    "Key,Title,Project,Status,Priority,Assignee,Reporter,Story Points,Due Date,Created At");
            verify(taskRepository).findAll();
        }

        @Test
        @DisplayName("should include project name in exported data")
        void shouldIncludeProjectName() {
            when(taskRepository.findAll()).thenReturn(List.of(task1));

            byte[] result = exportService.exportAllTasksToCSV();
            String csv = new String(result, StandardCharsets.UTF_8);

            String[] lines = csv.split("\\r?\\n");
            assertThat(lines[1]).contains("\"Test Project\"");
        }

        @Test
        @DisplayName("should export tasks from multiple projects")
        void shouldExportTasksFromMultipleProjects() {
            Project project2 = Project.builder().id(2L).name("Another Project").key("AP").build();
            Task task3 = Task.builder()
                    .id(102L)
                    .taskKey("AP-1")
                    .title("Other Project Task")
                    .status(TaskStatus.DONE)
                    .priority(TaskPriority.CRITICAL)
                    .project(project2)
                    .assignee(assignee)
                    .reporter(reporter)
                    .storyPoints(8)
                    .estimatedHours(0.0)
                    .loggedHours(0.0)
                    .dueDate(LocalDate.of(2025, 3, 1))
                    .createdAt(LocalDateTime.of(2025, 3, 1, 10, 0))
                    .build();

            when(taskRepository.findAll()).thenReturn(List.of(task1, task3));

            byte[] result = exportService.exportAllTasksToCSV();
            String csv = new String(result, StandardCharsets.UTF_8);

            String[] lines = csv.split("\\r?\\n");
            assertThat(lines).hasSize(3); // header + 2 tasks
            assertThat(lines[1]).contains("\"Test Project\"");
            assertThat(lines[2]).contains("\"Another Project\"");
        }

        @Test
        @DisplayName("should return only header when no tasks exist")
        void shouldReturnOnlyHeaderWhenNoTasks() {
            when(taskRepository.findAll()).thenReturn(Collections.emptyList());

            byte[] result = exportService.exportAllTasksToCSV();
            String csv = new String(result, StandardCharsets.UTF_8);

            String[] lines = csv.trim().split("\\r?\\n");
            assertThat(lines).hasSize(1);
            assertThat(lines[0]).startsWith("Key,Title,Project");
        }
    }
}
