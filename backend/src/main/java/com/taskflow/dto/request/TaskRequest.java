package com.taskflow.dto.request;

import com.taskflow.enums.TaskPriority;
import com.taskflow.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class TaskRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
    private String title;

    private String description;

    private TaskStatus status;
    private TaskPriority priority;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private Long assigneeId;
    private LocalDate dueDate;
    private Double estimatedHours;
    private Double loggedHours;
    private List<String> tags;
}
