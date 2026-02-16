package com.taskflow.controller;

import com.taskflow.dto.request.AutomationRuleRequest;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.AutomationRuleResponse;
import com.taskflow.service.AutomationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/automations")
@RequiredArgsConstructor
@Tag(name = "Automation", description = "Automation rule management endpoints")
public class AutomationController {

    private final AutomationService automationService;

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get project automation rules")
    public ResponseEntity<ApiResponse<List<AutomationRuleResponse>>> getProjectRules(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(automationService.getProjectRules(projectId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Create automation rule")
    public ResponseEntity<ApiResponse<AutomationRuleResponse>> createRule(@Valid @RequestBody AutomationRuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rule created", automationService.createRule(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Update automation rule")
    public ResponseEntity<ApiResponse<AutomationRuleResponse>> updateRule(@PathVariable Long id, @Valid @RequestBody AutomationRuleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Rule updated", automationService.updateRule(id, request)));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Toggle automation rule")
    public ResponseEntity<ApiResponse<Void>> toggleRule(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        automationService.toggleRule(id, request.getOrDefault("enabled", true));
        return ResponseEntity.ok(ApiResponse.success("Rule toggled", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Delete automation rule")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long id) {
        automationService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("Rule deleted", null));
    }
}
