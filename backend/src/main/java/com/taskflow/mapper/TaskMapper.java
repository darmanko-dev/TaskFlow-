package com.taskflow.mapper;

import com.taskflow.dto.response.LabelResponse;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.entity.Label;
import com.taskflow.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {UserMapper.class, CommentMapper.class})
public interface TaskMapper {

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "projectName", source = "project.name")
    @Mapping(target = "projectKey", source = "project.key")
    @Mapping(target = "sprintId", source = "sprint.id")
    @Mapping(target = "sprintName", source = "sprint.name")
    @Mapping(target = "epicId", source = "epic.id")
    @Mapping(target = "epicName", source = "epic.name")
    @Mapping(target = "epicColor", source = "epic.color")
    @Mapping(target = "parentTaskId", source = "parentTask.id")
    @Mapping(target = "parentTaskKey", source = "parentTask.taskKey")
    @Mapping(target = "subtasks", source = "subtasks")
    @Mapping(target = "labels", source = "labels", qualifiedByName = "labelsToResponse")
    @Mapping(target = "watcherCount", expression = "java(task.getWatchers() != null ? task.getWatchers().size() : 0)")
    @Mapping(target = "watching", constant = "false")
    @Mapping(target = "overdue", expression = "java(task.getDueDate() != null && task.getDueDate().isBefore(java.time.LocalDate.now()) && task.getStatus() != com.taskflow.enums.TaskStatus.DONE)")
    @Mapping(target = "comments", ignore = true)
    TaskResponse toResponse(Task task);

    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "projectName", source = "project.name")
    @Mapping(target = "projectKey", source = "project.key")
    @Mapping(target = "sprintId", source = "sprint.id")
    @Mapping(target = "sprintName", source = "sprint.name")
    @Mapping(target = "epicId", source = "epic.id")
    @Mapping(target = "epicName", source = "epic.name")
    @Mapping(target = "epicColor", source = "epic.color")
    @Mapping(target = "parentTaskId", source = "parentTask.id")
    @Mapping(target = "parentTaskKey", source = "parentTask.taskKey")
    @Mapping(target = "subtasks", source = "subtasks")
    @Mapping(target = "labels", source = "labels", qualifiedByName = "labelsToResponse")
    @Mapping(target = "watcherCount", expression = "java(task.getWatchers() != null ? task.getWatchers().size() : 0)")
    @Mapping(target = "watching", constant = "false")
    @Mapping(target = "overdue", expression = "java(task.getDueDate() != null && task.getDueDate().isBefore(java.time.LocalDate.now()) && task.getStatus() != com.taskflow.enums.TaskStatus.DONE)")
    @Mapping(target = "comments", source = "comments")
    TaskResponse toResponseWithComments(Task task);

    List<TaskResponse> toResponseList(List<Task> tasks);

    @Named("labelsToResponse")
    default List<LabelResponse> labelsToResponse(Set<Label> labels) {
        if (labels == null) return Collections.emptyList();
        return labels.stream()
                .map(l -> LabelResponse.builder()
                        .id(l.getId())
                        .name(l.getName())
                        .color(l.getColor())
                        .projectId(l.getProject().getId())
                        .build())
                .collect(Collectors.toList());
    }
}
