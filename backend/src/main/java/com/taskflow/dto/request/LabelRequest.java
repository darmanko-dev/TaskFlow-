package com.taskflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LabelRequest {
    @NotBlank(message = "Label name is required")
    private String name;
    
    @NotBlank(message = "Color is required")
    private String color;
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
}
