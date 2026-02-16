package com.taskflow.service;

import com.taskflow.dto.request.TaskRequest;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.entity.*;
import com.taskflow.enums.TaskPriority;
import com.taskflow.enums.TaskStatus;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.mapper.TaskMapper;
import com.taskflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SprintRepository sprintRepository;
    private final EpicRepository epicRepository;
    private final UserService userService;
    private final TaskMapper taskMapper;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    public Page<TaskResponse> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable).map(taskMapper::toResponse);
    }

    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        return taskMapper.toResponseWithComments(task);
    }

    public Page<TaskResponse> getTasksByProject(Long projectId, TaskStatus status, TaskPriority priority,
                                                  Long assigneeId, Pageable pageable) {
        return taskRepository.findByProjectWithFilters(projectId, status, priority, assigneeId, pageable)
                .map(taskMapper::toResponse);
    }

    public List<TaskResponse> getTasksByProjectGrouped(Long projectId) {
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return taskMapper.toResponseList(tasks);
    }

    public Page<TaskResponse> getMyTasks(Pageable pageable) {
        User currentUser = userService.getCurrentUserEntity();
        return taskRepository.findByAssigneeId(currentUser.getId(), pageable).map(taskMapper::toResponse);
    }

    public Page<TaskResponse> searchTasks(String query, Pageable pageable) {
        return taskRepository.searchTasks(query, pageable).map(taskMapper::toResponse);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        Project project = projectRepository.findByIdAndDeletedFalse(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        User reporter = userService.getCurrentUserEntity();
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssigneeId()));
        }

        Sprint sprint = null;
        if (request.getSprintId() != null) {
            sprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", request.getSprintId()));
        }

        Epic epic = null;
        if (request.getEpicId() != null) {
            epic = epicRepository.findById(request.getEpicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Epic", "id", request.getEpicId()));
        }

        Task parentTask = null;
        if (request.getParentTaskId() != null) {
            parentTask = taskRepository.findById(request.getParentTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task", "id", request.getParentTaskId()));
        }

        int seq = project.getNextTaskSequence();
        String taskKey = project.getKey() + "-" + String.format("%03d", seq);

        Task task = Task.builder()
                .taskKey(taskKey)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .project(project)
                .sprint(sprint)
                .epic(epic)
                .parentTask(parentTask)
                .assignee(assignee)
                .reporter(reporter)
                .dueDate(request.getDueDate())
                .estimatedHours(request.getEstimatedHours() != null ? request.getEstimatedHours() : 0.0)
                .loggedHours(request.getLoggedHours() != null ? request.getLoggedHours() : 0.0)
                .tags(request.getTags() != null ? request.getTags() : List.of())
                .build();

        projectRepository.save(project);
        taskRepository.save(task);

        activityLogService.log("CREATED", "TASK", task.getId(), task.getTaskKey(),
                "Created task: " + task.getTitle(), project.getId());

        if (assignee != null && !assignee.getId().equals(reporter.getId())) {
            notificationService.sendNotification(assignee.getId(), "TASK_ASSIGNED",
                    "New task assigned", reporter.getFullName() + " assigned you task " + task.getTaskKey() + ": " + task.getTitle(),
                    "TASK", task.getId());
        }

        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getEstimatedHours() != null) task.setEstimatedHours(request.getEstimatedHours());
        if (request.getLoggedHours() != null) task.setLoggedHours(request.getLoggedHours());
        if (request.getTags() != null) task.setTags(request.getTags());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssigneeId()));
            task.setAssignee(assignee);
        }

        if (request.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", request.getSprintId()));
            task.setSprint(sprint);
        }

        if (request.getEpicId() != null) {
            Epic epic = epicRepository.findById(request.getEpicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Epic", "id", request.getEpicId()));
            task.setEpic(epic);
        }

        if (request.getParentTaskId() != null) {
            Task parentTask = taskRepository.findById(request.getParentTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task", "id", request.getParentTaskId()));
            task.setParentTask(parentTask);
        }

        taskRepository.save(task);

        activityLogService.log("UPDATED", "TASK", task.getId(), task.getTaskKey(),
                "Updated task: " + task.getTitle(), task.getProject().getId());

        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(status);
        taskRepository.save(task);

        activityLogService.log("STATUS_CHANGED", "TASK", task.getId(), task.getTaskKey(),
                "Changed status from " + oldStatus + " to " + status, task.getProject().getId());

        if (task.getAssignee() != null) {
            User currentUser = userService.getCurrentUserEntity();
            if (!task.getAssignee().getId().equals(currentUser.getId())) {
                notificationService.sendNotification(task.getAssignee().getId(), "TASK_STATUS_CHANGED",
                        "Task status updated", currentUser.getFullName() + " changed " + task.getTaskKey() + " status to " + status,
                        "TASK", task.getId());
            }
        }

        return taskMapper.toResponse(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        activityLogService.log("DELETED", "TASK", task.getId(), task.getTaskKey(),
                "Deleted task: " + task.getTitle(), task.getProject().getId());

        taskRepository.delete(task);
    }
}
