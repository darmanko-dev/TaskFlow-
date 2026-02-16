package com.taskflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponse {
    private Long id;
    private UserResponse user;
    private String action;
    private String entityType;
    private Long entityId;
    private String entityName;
    private String details;
    private Long projectId;
    private LocalDateTime createdAt;
}
