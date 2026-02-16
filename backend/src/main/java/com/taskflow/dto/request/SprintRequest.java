package com.taskflow.dto.request;

import com.taskflow.enums.SprintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SprintRequest {
    @NotBlank(message = "Sprint name is required")
    private String name;

    private String goal;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private SprintStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
}
