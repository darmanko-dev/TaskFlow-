package com.taskflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EpicRequest {
    @NotBlank(message = "Epic name is required")
    private String name;

    private String description;
    private String color;

    @NotNull(message = "Project ID is required")
    private Long projectId;
}
