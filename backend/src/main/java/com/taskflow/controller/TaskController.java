package com.taskflow.controller;

import com.taskflow.dto.request.BulkTaskUpdateRequest;
import com.taskflow.dto.request.TaskRequest;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.enums.TaskPriority;
import com.taskflow.enums.TaskStatus;
import com.taskflow.service.TaskService;
import com.taskflow.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management endpoints")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all tasks")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<TaskResponse> tasks = taskService.getAllTasks(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody TaskRequest request) {
        TaskResponse response = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTaskById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update task")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Task updated",
                taskService.updateTask(id, request)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update task status (for drag & drop)")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        TaskStatus status = TaskStatus.valueOf(request.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                taskService.updateTaskStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted", null));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get tasks by project")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) Long assigneeId) {
        List<TaskResponse> tasks = taskService.getTasksByProjectGrouped(projectId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/my-tasks")
    @Operation(summary = "Get my assigned tasks")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getMyTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<TaskResponse> tasks = taskService.getMyTasks(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/watched")
    @Operation(summary = "Get watched tasks")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getWatchedTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<TaskResponse> tasks = taskService.getWatchedTasks(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/search")
    @Operation(summary = "Search tasks")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> searchTasks(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<TaskResponse> tasks = taskService.searchTasks(query,
                PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PostMapping("/{taskId}/watchers")
    @Operation(summary = "Watch a task")
    public ResponseEntity<ApiResponse<Void>> watchTask(@PathVariable Long taskId) {
        Long userId = userService.getCurrentUserEntity().getId();
        taskService.addWatcher(taskId, userId);
        return ResponseEntity.ok(ApiResponse.success("Now watching task", null));
    }

    @DeleteMapping("/{taskId}/watchers")
    @Operation(summary = "Unwatch a task")
    public ResponseEntity<ApiResponse<Void>> unwatchTask(@PathVariable Long taskId) {
        Long userId = userService.getCurrentUserEntity().getId();
        taskService.removeWatcher(taskId, userId);
        return ResponseEntity.ok(ApiResponse.success("Stopped watching task", null));
    }

    @PatchMapping("/bulk")
    @Operation(summary = "Bulk update tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> bulkUpdateTasks(
            @Valid @RequestBody BulkTaskUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tasks updated",
                taskService.bulkUpdateTasks(request)));
    }
}
