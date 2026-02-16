package com.taskflow.service;

import com.taskflow.dto.request.EpicRequest;
import com.taskflow.dto.response.EpicResponse;
import com.taskflow.entity.Epic;
import com.taskflow.entity.Project;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.EpicRepository;
import com.taskflow.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EpicService {

    private final EpicRepository epicRepository;
    private final ProjectRepository projectRepository;
    private final ActivityLogService activityLogService;

    public List<EpicResponse> getProjectEpics(Long projectId) {
        return epicRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public EpicResponse getEpicById(Long id) {
        Epic epic = epicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Epic", "id", id));
        return toResponse(epic);
    }

    @Transactional
    public EpicResponse createEpic(EpicRequest request) {
        Project project = projectRepository.findByIdAndDeletedFalse(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        Epic epic = Epic.builder()
                .name(request.getName())
                .description(request.getDescription())
                .color(request.getColor() != null ? request.getColor() : "#6366F1")
                .project(project)
                .build();

        epicRepository.save(epic);

        activityLogService.log("CREATED", "EPIC", epic.getId(), epic.getName(),
                "Created epic: " + epic.getName(), project.getId());

        return toResponse(epic);
    }

    @Transactional
    public EpicResponse updateEpic(Long id, EpicRequest request) {
        Epic epic = epicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Epic", "id", id));

        epic.setName(request.getName());
        if (request.getDescription() != null) epic.setDescription(request.getDescription());
        if (request.getColor() != null) epic.setColor(request.getColor());

        epicRepository.save(epic);

        activityLogService.log("UPDATED", "EPIC", epic.getId(), epic.getName(),
                "Updated epic: " + epic.getName(), epic.getProject().getId());

        return toResponse(epic);
    }

    @Transactional
    public void deleteEpic(Long id) {
        Epic epic = epicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Epic", "id", id));

        epic.getTasks().forEach(t -> t.setEpic(null));

        activityLogService.log("DELETED", "EPIC", epic.getId(), epic.getName(),
                "Deleted epic: " + epic.getName(), epic.getProject().getId());

        epicRepository.delete(epic);
    }

    private EpicResponse toResponse(Epic epic) {
        long totalTasks = epicRepository.countTasksByEpic(epic.getId());
        long completedTasks = epicRepository.countCompletedTasksByEpic(epic.getId());

        return EpicResponse.builder()
                .id(epic.getId())
                .name(epic.getName())
                .description(epic.getDescription())
                .color(epic.getColor())
                .projectId(epic.getProject().getId())
                .projectName(epic.getProject().getName())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .progressPercentage(totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0)
                .createdAt(epic.getCreatedAt())
                .updatedAt(epic.getUpdatedAt())
                .build();
    }
}
