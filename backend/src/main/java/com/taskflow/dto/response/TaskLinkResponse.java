package com.taskflow.dto.response;

import com.taskflow.enums.LinkType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskLinkResponse {
    private Long id;
    private Long sourceTaskId;
    private String sourceTaskKey;
    private String sourceTaskTitle;
    private Long targetTaskId;
    private String targetTaskKey;
    private String targetTaskTitle;
    private LinkType linkType;
    private LocalDateTime createdAt;
}
