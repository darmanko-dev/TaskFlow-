package com.taskflow.dto.response;

import com.taskflow.enums.SprintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintResponse {
    private Long id;
    private String name;
    private String goal;
    private Long projectId;
    private String projectName;
    private SprintStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private long totalTasks;
    private long completedTasks;
    private long todoTasks;
    private long inProgressTasks;
    private double progressPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
