package com.taskflow.dto.request;

import com.taskflow.enums.LinkType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskLinkRequest {
    @NotNull(message = "Source task ID is required")
    private Long sourceTaskId;
    
    @NotNull(message = "Target task ID is required")
    private Long targetTaskId;
    
    @NotNull(message = "Link type is required")
    private LinkType linkType;
}
