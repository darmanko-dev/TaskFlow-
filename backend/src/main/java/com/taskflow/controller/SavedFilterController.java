package com.taskflow.controller;

import com.taskflow.dto.request.SavedFilterRequest;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.SavedFilterResponse;
import com.taskflow.service.SavedFilterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/filters")
@RequiredArgsConstructor
@Tag(name = "Saved Filters", description = "Saved filter management endpoints")
public class SavedFilterController {

    private final SavedFilterService savedFilterService;

    @GetMapping
    @Operation(summary = "Get user's saved filters")
    public ResponseEntity<ApiResponse<List<SavedFilterResponse>>> getUserFilters() {
        return ResponseEntity.ok(ApiResponse.success(savedFilterService.getUserFilters()));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get accessible filters for a project")
    public ResponseEntity<ApiResponse<List<SavedFilterResponse>>> getProjectFilters(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(savedFilterService.getProjectFilters(projectId)));
    }

    @PostMapping
    @Operation(summary = "Create a saved filter")
    public ResponseEntity<ApiResponse<SavedFilterResponse>> createFilter(@Valid @RequestBody SavedFilterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Filter saved", savedFilterService.createFilter(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a saved filter")
    public ResponseEntity<ApiResponse<SavedFilterResponse>> updateFilter(@PathVariable Long id, @Valid @RequestBody SavedFilterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Filter updated", savedFilterService.updateFilter(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a saved filter")
    public ResponseEntity<ApiResponse<Void>> deleteFilter(@PathVariable Long id) {
        savedFilterService.deleteFilter(id);
        return ResponseEntity.ok(ApiResponse.success("Filter deleted", null));
    }
}
