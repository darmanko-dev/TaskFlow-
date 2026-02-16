package com.taskflow.service;

import com.taskflow.dto.request.SprintRequest;
import com.taskflow.dto.response.SprintResponse;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.entity.Project;
import com.taskflow.entity.Sprint;
import com.taskflow.entity.Task;
import com.taskflow.enums.SprintStatus;
import com.taskflow.exception.BadRequestException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.mapper.TaskMapper;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.SprintRepository;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final ActivityLogService activityLogService;

    public List<SprintResponse> getProjectSprints(Long projectId) {
        return sprintRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SprintResponse getSprintById(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", id));
        return toResponse(sprint);
    }

    public List<TaskResponse> getSprintTasks(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));
        return sprint.getTasks().stream().map(taskMapper::toResponse).collect(Collectors.toList());
    }

    public List<TaskResponse> getBacklogTasks(Long projectId) {
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return tasks.stream()
                .filter(t -> t.getSprint() == null)
                .map(taskMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SprintResponse createSprint(SprintRequest request) {
        Project project = projectRepository.findByIdAndDeletedFalse(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        Sprint sprint = Sprint.builder()
                .name(request.getName())
                .goal(request.getGoal())
                .project(project)
                .status(request.getStatus() != null ? request.getStatus() : SprintStatus.PLANNING)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        sprintRepository.save(sprint);

        activityLogService.log("CREATED", "SPRINT", sprint.getId(), sprint.getName(),
                "Created sprint: " + sprint.getName(), project.getId());

        return toResponse(sprint);
    }

    @Transactional
    public SprintResponse updateSprint(Long id, SprintRequest request) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", id));

        sprint.setName(request.getName());
        sprint.setGoal(request.getGoal());
        if (request.getStartDate() != null) sprint.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) sprint.setEndDate(request.getEndDate());
        if (request.getStatus() != null) sprint.setStatus(request.getStatus());

        sprintRepository.save(sprint);

        activityLogService.log("UPDATED", "SPRINT", sprint.getId(), sprint.getName(),
                "Updated sprint: " + sprint.getName(), sprint.getProject().getId());

        return toResponse(sprint);
    }

    @Transactional
    public SprintResponse startSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", id));

        sprintRepository.findByProjectIdAndStatus(sprint.getProject().getId(), SprintStatus.ACTIVE)
                .ifPresent(s -> {
                    throw new BadRequestException("Project already has an active sprint: " + s.getName());
                });

        sprint.setStatus(SprintStatus.ACTIVE);
        sprintRepository.save(sprint);

        activityLogService.log("STARTED", "SPRINT", sprint.getId(), sprint.getName(),
                "Started sprint: " + sprint.getName(), sprint.getProject().getId());

        return toResponse(sprint);
    }

    @Transactional
    public SprintResponse completeSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", id));

        sprint.setStatus(SprintStatus.COMPLETED);
        sprintRepository.save(sprint);

        activityLogService.log("COMPLETED", "SPRINT", sprint.getId(), sprint.getName(),
                "Completed sprint: " + sprint.getName(), sprint.getProject().getId());

        return toResponse(sprint);
    }

    @Transactional
    public void addTaskToSprint(Long sprintId, Long taskId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        task.setSprint(sprint);
        taskRepository.save(task);
    }

    @Transactional
    public void removeTaskFromSprint(Long sprintId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        task.setSprint(null);
        taskRepository.save(task);
    }

    @Transactional
    public void deleteSprint(Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", id));

        sprint.getTasks().forEach(t -> t.setSprint(null));
        taskRepository.saveAll(sprint.getTasks());

        activityLogService.log("DELETED", "SPRINT", sprint.getId(), sprint.getName(),
                "Deleted sprint: " + sprint.getName(), sprint.getProject().getId());

        sprintRepository.delete(sprint);
    }

    private SprintResponse toResponse(Sprint sprint) {
        long totalTasks = sprintRepository.countTasksBySprint(sprint.getId());
        long completedTasks = sprintRepository.countCompletedTasksBySprint(sprint.getId());
        long todoTasks = sprintRepository.countTodoTasksBySprint(sprint.getId());
        long inProgressTasks = sprintRepository.countInProgressTasksBySprint(sprint.getId());

        return SprintResponse.builder()
                .id(sprint.getId())
                .name(sprint.getName())
                .goal(sprint.getGoal())
                .projectId(sprint.getProject().getId())
                .projectName(sprint.getProject().getName())
                .status(sprint.getStatus())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .todoTasks(todoTasks)
                .inProgressTasks(inProgressTasks)
                .progressPercentage(totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0)
                .createdAt(sprint.getCreatedAt())
                .updatedAt(sprint.getUpdatedAt())
                .build();
    }
}
