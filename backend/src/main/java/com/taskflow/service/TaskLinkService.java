package com.taskflow.service;

import com.taskflow.dto.request.TaskLinkRequest;
import com.taskflow.dto.response.TaskLinkResponse;
import com.taskflow.entity.Task;
import com.taskflow.entity.TaskLink;
import com.taskflow.enums.LinkType;
import com.taskflow.exception.BadRequestException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.TaskLinkRepository;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskLinkService {

    private final TaskLinkRepository taskLinkRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogService activityLogService;

    public List<TaskLinkResponse> getTaskLinks(Long taskId) {
        return taskLinkRepository.findByTaskId(taskId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskLinkResponse createLink(TaskLinkRequest request) {
        if (request.getSourceTaskId().equals(request.getTargetTaskId())) {
            throw new BadRequestException("Cannot link a task to itself");
        }

        Task sourceTask = taskRepository.findById(request.getSourceTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", request.getSourceTaskId()));
        Task targetTask = taskRepository.findById(request.getTargetTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", request.getTargetTaskId()));

        TaskLink link = TaskLink.builder()
                .sourceTask(sourceTask)
                .targetTask(targetTask)
                .linkType(request.getLinkType())
                .build();

        taskLinkRepository.save(link);

        activityLogService.log("LINKED", "TASK", sourceTask.getId(), sourceTask.getTaskKey(),
                sourceTask.getTaskKey() + " " + request.getLinkType() + " " + targetTask.getTaskKey(),
                sourceTask.getProject().getId());

        return toResponse(link);
    }

    @Transactional
    public void deleteLink(Long id) {
        TaskLink link = taskLinkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TaskLink", "id", id));
        taskLinkRepository.delete(link);
    }

    private TaskLinkResponse toResponse(TaskLink link) {
        return TaskLinkResponse.builder()
                .id(link.getId())
                .sourceTaskId(link.getSourceTask().getId())
                .sourceTaskKey(link.getSourceTask().getTaskKey())
                .sourceTaskTitle(link.getSourceTask().getTitle())
                .targetTaskId(link.getTargetTask().getId())
                .targetTaskKey(link.getTargetTask().getTaskKey())
                .targetTaskTitle(link.getTargetTask().getTitle())
                .linkType(link.getLinkType())
                .createdAt(link.getCreatedAt())
                .build();
    }
}
