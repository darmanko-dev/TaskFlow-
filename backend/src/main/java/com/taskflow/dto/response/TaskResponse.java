package com.taskflow.dto.response;

import com.taskflow.enums.TaskPriority;
import com.taskflow.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String taskKey;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Long projectId;
    private String projectName;
    private String projectKey;
    private UserResponse assignee;
    private UserResponse reporter;
    private Long sprintId;
    private String sprintName;
    private Long epicId;
    private String epicName;
    private String epicColor;
    private Long parentTaskId;
    private String parentTaskKey;
    private List<TaskResponse> subtasks;
    private LocalDate dueDate;
    private Double estimatedHours;
    private Double loggedHours;
    private List<String> tags;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean overdue;
}
