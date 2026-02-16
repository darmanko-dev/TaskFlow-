package com.taskflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AutomationRuleRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @NotBlank(message = "Trigger type is required")
    private String triggerType;
    
    @NotBlank(message = "Trigger config is required")
    private String triggerConfig;
    
    @NotBlank(message = "Action type is required")
    private String actionType;
    
    @NotBlank(message = "Action config is required")
    private String actionConfig;
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    private boolean enabled = true;
}
