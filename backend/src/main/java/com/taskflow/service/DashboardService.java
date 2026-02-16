package com.taskflow.service;

import com.taskflow.dto.response.DashboardStatsResponse;
import com.taskflow.dto.response.ProjectResponse;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.entity.Project;
import com.taskflow.entity.User;
import com.taskflow.enums.TaskPriority;
import com.taskflow.enums.TaskStatus;
import com.taskflow.mapper.ProjectMapper;
import com.taskflow.mapper.TaskMapper;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserService userService;
    private final TaskMapper taskMapper;
    private final ProjectMapper projectMapper;

    public DashboardStatsResponse getGlobalStats() {
        User currentUser = userService.getCurrentUserEntity();
        Long userId = currentUser.getId();

        long totalProjects = projectRepository.countUserProjects(userId);
        long totalTasks = taskRepository.countByUser(userId);
        long completedTasks = taskRepository.countByUserAndStatus(userId, TaskStatus.DONE);
        long overdueTasks = taskRepository.countOverdueByUser(userId);

        Map<String, Long> tasksByStatus = new LinkedHashMap<>();
        for (TaskStatus status : TaskStatus.values()) {
            tasksByStatus.put(status.name(), taskRepository.countByUserAndStatus(userId, status));
        }

        Map<String, Long> tasksByPriority = new LinkedHashMap<>();
        for (TaskPriority priority : TaskPriority.values()) {
            tasksByPriority.put(priority.name(), taskRepository.countByUserAndPriority(userId, priority));
        }

        List<TaskResponse> recentTasks = taskRepository.findRecentByUser(userId, PageRequest.of(0, 5))
                .getContent().stream().map(taskMapper::toResponse).collect(Collectors.toList());

        List<Project> projects = projectRepository.findUserProjects(userId, PageRequest.of(0, 5)).getContent();
        List<ProjectResponse> projectProgress = projects.stream().map(p -> {
            ProjectResponse pr = projectMapper.toResponse(p);
            long total = taskRepository.countByProjectId(p.getId());
            long completed = taskRepository.countByProjectIdAndStatus(p.getId(), TaskStatus.DONE);
            pr.setTotalTasks(total);
            pr.setCompletedTasks(completed);
            pr.setProgressPercentage(total > 0 ? (double) completed / total * 100 : 0);
            return pr;
        }).collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalProjects(totalProjects)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .overdueTasks(overdueTasks)
                .tasksByStatus(tasksByStatus)
                .tasksByPriority(tasksByPriority)
                .recentTasks(recentTasks)
                .projectProgress(projectProgress)
                .build();
    }

    public DashboardStatsResponse getProjectStats(Long projectId) {
        long totalTasks = taskRepository.countByProjectId(projectId);
        long completedTasks = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.DONE);
        long overdueTasks = 0;

        Map<String, Long> tasksByStatus = new LinkedHashMap<>();
        for (TaskStatus status : TaskStatus.values()) {
            tasksByStatus.put(status.name(), taskRepository.countByProjectIdAndStatus(projectId, status));
        }

        Map<String, Long> tasksByPriority = new LinkedHashMap<>();
        List<TaskResponse> recentTasks = taskRepository.findByProjectId(projectId, PageRequest.of(0, 5))
                .getContent().stream().map(taskMapper::toResponse).collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .overdueTasks(overdueTasks)
                .tasksByStatus(tasksByStatus)
                .tasksByPriority(tasksByPriority)
                .recentTasks(recentTasks)
                .build();
    }
}
