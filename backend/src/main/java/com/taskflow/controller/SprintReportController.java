package com.taskflow.controller;

import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.SprintReportResponse;
import com.taskflow.service.SprintReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Agile reporting endpoints")
public class SprintReportController {

    private final SprintReportService sprintReportService;

    @GetMapping("/sprint/{sprintId}")
    @Operation(summary = "Get sprint report with burndown data")
    public ResponseEntity<ApiResponse<SprintReportResponse>> getSprintReport(@PathVariable Long sprintId) {
        return ResponseEntity.ok(ApiResponse.success(sprintReportService.getSprintReport(sprintId)));
    }

    @GetMapping("/velocity/{projectId}")
    @Operation(summary = "Get team velocity")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getTeamVelocity(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "5") int sprints) {
        double velocity = sprintReportService.getTeamVelocity(projectId, sprints);
        return ResponseEntity.ok(ApiResponse.success(Map.of("velocity", velocity)));
    }
}
