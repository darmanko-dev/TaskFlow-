package com.taskflow.dto.request;

import com.taskflow.enums.TaskPriority;
import com.taskflow.enums.TaskStatus;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkTaskUpdateRequest {
    @NotEmpty(message = "Task IDs are required")
    private List<Long> taskIds;
    
    private TaskStatus status;
    private TaskPriority priority;
    private Long assigneeId;
    private Long sprintId;
    private Long epicId;
    private List<Long> labelIds;
}
