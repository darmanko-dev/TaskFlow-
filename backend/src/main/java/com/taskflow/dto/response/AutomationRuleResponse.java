package com.taskflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationRuleResponse {
    private Long id;
    private String name;
    private String description;
    private String triggerType;
    private String triggerConfig;
    private String actionType;
    private String actionConfig;
    private Long projectId;
    private boolean enabled;
    private LocalDateTime createdAt;
}
