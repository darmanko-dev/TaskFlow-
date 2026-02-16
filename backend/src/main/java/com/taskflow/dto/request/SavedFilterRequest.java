package com.taskflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SavedFilterRequest {
    @NotBlank(message = "Filter name is required")
    private String name;
    
    @NotBlank(message = "Filter JSON is required")
    private String filterJson;
    
    private Long projectId;
    private boolean shared;
}
