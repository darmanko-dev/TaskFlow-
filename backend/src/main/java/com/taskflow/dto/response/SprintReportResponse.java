package com.taskflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintReportResponse {
    private Long sprintId;
    private String sprintName;
    private LocalDate startDate;
    private LocalDate endDate;
    private int committedPoints;
    private int completedPoints;
    private int totalTasks;
    private int completedTasks;
    private int addedDuringSprint;
    private int removedDuringSprint;
    private List<Map<String, Object>> burndownData;
    private Map<String, Integer> tasksByStatus;
    private Map<String, Integer> tasksByPriority;
    private double velocity;
}
