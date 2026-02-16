package com.taskflow.service;

import com.taskflow.dto.response.ActivityLogResponse;
import com.taskflow.entity.ActivityLog;
import com.taskflow.entity.User;
import com.taskflow.mapper.UserMapper;
import com.taskflow.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserService userService;
    private final UserMapper userMapper;

    @Transactional
    public void log(String action, String entityType, Long entityId, String entityName, String details, Long projectId) {
        User currentUser = userService.getCurrentUserEntity();
        ActivityLog log = ActivityLog.builder()
                .user(currentUser)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .entityName(entityName)
                .details(details)
                .projectId(projectId)
                .build();
        activityLogRepository.save(log);
    }

    @Transactional
    public void log(User user, String action, String entityType, Long entityId, String entityName, String details, Long projectId) {
        ActivityLog log = ActivityLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .entityName(entityName)
                .details(details)
                .projectId(projectId)
                .build();
        activityLogRepository.save(log);
    }

    public Page<ActivityLogResponse> getProjectActivities(Long projectId, Pageable pageable) {
        return activityLogRepository.findByProjectIdOrderByCreatedAtDesc(projectId, pageable)
                .map(this::toResponse);
    }

    public Page<ActivityLogResponse> getEntityActivities(String entityType, Long entityId, Pageable pageable) {
        return activityLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable)
                .map(this::toResponse);
    }

    public Page<ActivityLogResponse> getAllActivities(Pageable pageable) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toResponse);
    }

    private ActivityLogResponse toResponse(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .user(userMapper.toResponse(log.getUser()))
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .entityName(log.getEntityName())
                .details(log.getDetails())
                .projectId(log.getProjectId())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
