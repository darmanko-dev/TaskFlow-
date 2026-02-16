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
public class SavedFilterResponse {
    private Long id;
    private String name;
    private String filterJson;
    private Long userId;
    private String userName;
    private Long projectId;
    private boolean shared;
    private LocalDateTime createdAt;
}
