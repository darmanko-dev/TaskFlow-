package com.taskflow.controller;

import com.taskflow.dto.response.ActivityLogResponse;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@Tag(name = "Activity Log", description = "Activity history endpoints")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    @Operation(summary = "Get all activities")
    public ResponseEntity<ApiResponse<Page<ActivityLogResponse>>> getAllActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                activityLogService.getAllActivities(PageRequest.of(page, size))));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get project activities")
    public ResponseEntity<ApiResponse<Page<ActivityLogResponse>>> getProjectActivities(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                activityLogService.getProjectActivities(projectId, PageRequest.of(page, size))));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Get entity activities")
    public ResponseEntity<ApiResponse<Page<ActivityLogResponse>>> getEntityActivities(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                activityLogService.getEntityActivities(entityType, entityId, PageRequest.of(page, size))));
    }
}
