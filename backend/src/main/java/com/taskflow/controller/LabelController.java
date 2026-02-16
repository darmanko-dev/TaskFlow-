package com.taskflow.controller;

import com.taskflow.dto.request.LabelRequest;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.LabelResponse;
import com.taskflow.service.LabelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/labels")
@RequiredArgsConstructor
@Tag(name = "Labels", description = "Label management endpoints")
public class LabelController {

    private final LabelService labelService;

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get project labels")
    public ResponseEntity<ApiResponse<List<LabelResponse>>> getProjectLabels(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(labelService.getProjectLabels(projectId)));
    }

    @PostMapping
    @Operation(summary = "Create a label")
    public ResponseEntity<ApiResponse<LabelResponse>> createLabel(@Valid @RequestBody LabelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Label created", labelService.createLabel(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a label")
    public ResponseEntity<ApiResponse<LabelResponse>> updateLabel(@PathVariable Long id, @Valid @RequestBody LabelRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Label updated", labelService.updateLabel(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a label")
    public ResponseEntity<ApiResponse<Void>> deleteLabel(@PathVariable Long id) {
        labelService.deleteLabel(id);
        return ResponseEntity.ok(ApiResponse.success("Label deleted", null));
    }
}
