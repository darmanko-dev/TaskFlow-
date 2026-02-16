package com.taskflow.controller;

import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.DashboardStatsResponse;
import com.taskflow.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard statistics endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get global dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getGlobalStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getGlobalStats()));
    }

    @GetMapping("/project/{id}/stats")
    @Operation(summary = "Get project statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getProjectStats(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getProjectStats(id)));
    }
}
