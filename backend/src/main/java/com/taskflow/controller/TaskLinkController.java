package com.taskflow.controller;

import com.taskflow.dto.request.TaskLinkRequest;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.TaskLinkResponse;
import com.taskflow.service.TaskLinkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task-links")
@RequiredArgsConstructor
@Tag(name = "Task Links", description = "Task link management endpoints")
public class TaskLinkController {

    private final TaskLinkService taskLinkService;

    @GetMapping("/task/{taskId}")
    @Operation(summary = "Get task links")
    public ResponseEntity<ApiResponse<List<TaskLinkResponse>>> getTaskLinks(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success(taskLinkService.getTaskLinks(taskId)));
    }

    @PostMapping
    @Operation(summary = "Create a task link")
    public ResponseEntity<ApiResponse<TaskLinkResponse>> createLink(@Valid @RequestBody TaskLinkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Link created", taskLinkService.createLink(request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task link")
    public ResponseEntity<ApiResponse<Void>> deleteLink(@PathVariable Long id) {
        taskLinkService.deleteLink(id);
        return ResponseEntity.ok(ApiResponse.success("Link deleted", null));
    }
}
