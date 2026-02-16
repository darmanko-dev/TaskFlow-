package com.taskflow.controller;

import com.taskflow.dto.request.EpicRequest;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.EpicResponse;
import com.taskflow.service.EpicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/epics")
@RequiredArgsConstructor
@Tag(name = "Epics", description = "Epic management endpoints")
public class EpicController {

    private final EpicService epicService;

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all epics for a project")
    public ResponseEntity<ApiResponse<List<EpicResponse>>> getProjectEpics(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(epicService.getProjectEpics(projectId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get epic by ID")
    public ResponseEntity<ApiResponse<EpicResponse>> getEpicById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(epicService.getEpicById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new epic")
    public ResponseEntity<ApiResponse<EpicResponse>> createEpic(@Valid @RequestBody EpicRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Epic created", epicService.createEpic(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update epic")
    public ResponseEntity<ApiResponse<EpicResponse>> updateEpic(@PathVariable Long id, @Valid @RequestBody EpicRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Epic updated", epicService.updateEpic(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete epic")
    public ResponseEntity<ApiResponse<Void>> deleteEpic(@PathVariable Long id) {
        epicService.deleteEpic(id);
        return ResponseEntity.ok(ApiResponse.success("Epic deleted", null));
    }
}
