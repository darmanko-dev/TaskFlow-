package com.taskflow.mapper;

import com.taskflow.dto.response.TaskResponse;
import com.taskflow.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

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
    @Mapping(target = "overdue", expression = "java(task.getDueDate() != null && task.getDueDate().isBefore(java.time.LocalDate.now()) && task.getStatus() != com.taskflow.enums.TaskStatus.DONE)")
    @Mapping(target = "comments", source = "comments")
    TaskResponse toResponseWithComments(Task task);

    List<TaskResponse> toResponseList(List<Task> tasks);
}
