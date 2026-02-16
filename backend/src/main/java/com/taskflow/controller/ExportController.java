package com.taskflow.controller;

import com.taskflow.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "Data export endpoints")
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/tasks/csv")
    @Operation(summary = "Export all tasks to CSV")
    public ResponseEntity<byte[]> exportAllTasksCSV() {
        byte[] csv = exportService.exportAllTasksToCSV();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tasks.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/projects/{projectId}/tasks/csv")
    @Operation(summary = "Export project tasks to CSV")
    public ResponseEntity<byte[]> exportProjectTasksCSV(@PathVariable Long projectId) {
        byte[] csv = exportService.exportTasksToCSV(projectId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=project-tasks.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
