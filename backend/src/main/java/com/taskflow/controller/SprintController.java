package com.taskflow.controller;

import com.taskflow.dto.request.SprintRequest;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.SprintResponse;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.service.SprintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sprints")
@RequiredArgsConstructor
@Tag(name = "Sprints", description = "Sprint management endpoints")
public class SprintController {

    private final SprintService sprintService;

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all sprints for a project")
    public ResponseEntity<ApiResponse<List<SprintResponse>>> getProjectSprints(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(sprintService.getProjectSprints(projectId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sprint by ID")
    public ResponseEntity<ApiResponse<SprintResponse>> getSprintById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(sprintService.getSprintById(id)));
    }

    @GetMapping("/{id}/tasks")
    @Operation(summary = "Get sprint tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getSprintTasks(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(sprintService.getSprintTasks(id)));
    }

    @GetMapping("/project/{projectId}/backlog")
    @Operation(summary = "Get backlog tasks (tasks without sprint)")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getBacklogTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(sprintService.getBacklogTasks(projectId)));
    }

    @PostMapping
    @Operation(summary = "Create a new sprint")
    public ResponseEntity<ApiResponse<SprintResponse>> createSprint(@Valid @RequestBody SprintRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sprint created", sprintService.createSprint(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update sprint")
    public ResponseEntity<ApiResponse<SprintResponse>> updateSprint(@PathVariable Long id, @Valid @RequestBody SprintRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Sprint updated", sprintService.updateSprint(id, request)));
    }

    @PatchMapping("/{id}/start")
    @Operation(summary = "Start sprint")
    public ResponseEntity<ApiResponse<SprintResponse>> startSprint(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Sprint started", sprintService.startSprint(id)));
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Complete sprint")
    public ResponseEntity<ApiResponse<SprintResponse>> completeSprint(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Sprint completed", sprintService.completeSprint(id)));
    }

    @PostMapping("/{sprintId}/tasks/{taskId}")
    @Operation(summary = "Add task to sprint")
    public ResponseEntity<ApiResponse<Void>> addTaskToSprint(@PathVariable Long sprintId, @PathVariable Long taskId) {
        sprintService.addTaskToSprint(sprintId, taskId);
        return ResponseEntity.ok(ApiResponse.success("Task added to sprint", null));
    }

    @DeleteMapping("/{sprintId}/tasks/{taskId}")
    @Operation(summary = "Remove task from sprint")
    public ResponseEntity<ApiResponse<Void>> removeTaskFromSprint(@PathVariable Long sprintId, @PathVariable Long taskId) {
        sprintService.removeTaskFromSprint(sprintId, taskId);
        return ResponseEntity.ok(ApiResponse.success("Task removed from sprint", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete sprint")
    public ResponseEntity<ApiResponse<Void>> deleteSprint(@PathVariable Long id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.ok(ApiResponse.success("Sprint deleted", null));
    }
}
