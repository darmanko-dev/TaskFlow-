package com.taskflow.service;

import com.taskflow.dto.request.ProjectRequest;
import com.taskflow.dto.response.ProjectResponse;
import com.taskflow.entity.Project;
import com.taskflow.entity.User;
import com.taskflow.enums.ProjectStatus;
import com.taskflow.enums.TaskStatus;
import com.taskflow.exception.BadRequestException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.mapper.ProjectMapper;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ProjectMapper projectMapper;

    public Page<ProjectResponse> getUserProjects(ProjectStatus status, Pageable pageable) {
        User currentUser = userService.getCurrentUserEntity();
        Page<Project> projects;
        if (status != null) {
            projects = projectRepository.findUserProjectsByStatus(currentUser.getId(), status, pageable);
        } else {
            projects = projectRepository.findUserProjects(currentUser.getId(), pageable);
        }
        return projects.map(this::enrichProjectResponse);
    }

    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        return enrichProjectResponse(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        if (projectRepository.existsByKey(request.getKey().toUpperCase())) {
            throw new BadRequestException("Project key already exists");
        }

        User currentUser = userService.getCurrentUserEntity();

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .key(request.getKey().toUpperCase())
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.ACTIVE)
                .owner(currentUser)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        project.getMembers().add(currentUser);
        projectRepository.save(project);
        return enrichProjectResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());

        projectRepository.save(project);
        return enrichProjectResponse(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        project.setDeleted(true);
        projectRepository.save(project);
    }

    @Transactional
    public ProjectResponse addMember(Long projectId, Long userId) {
        Project project = projectRepository.findByIdAndDeletedFalse(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        project.getMembers().add(user);
        projectRepository.save(project);
        return enrichProjectResponse(project);
    }

    @Transactional
    public ProjectResponse removeMember(Long projectId, Long userId) {
        Project project = projectRepository.findByIdAndDeletedFalse(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        project.getMembers().removeIf(m -> m.getId().equals(userId));
        projectRepository.save(project);
        return enrichProjectResponse(project);
    }

    private ProjectResponse enrichProjectResponse(Project project) {
        ProjectResponse response = projectMapper.toResponse(project);
        long totalTasks = taskRepository.countByProjectId(project.getId());
        long completedTasks = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.DONE);
        response.setTotalTasks(totalTasks);
        response.setCompletedTasks(completedTasks);
        response.setProgressPercentage(totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0);
        return response;
    }
}
