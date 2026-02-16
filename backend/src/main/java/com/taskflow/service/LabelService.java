package com.taskflow.service;

import com.taskflow.dto.request.LabelRequest;
import com.taskflow.dto.response.LabelResponse;
import com.taskflow.entity.Label;
import com.taskflow.entity.Project;
import com.taskflow.exception.BadRequestException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.LabelRepository;
import com.taskflow.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;

    public List<LabelResponse> getProjectLabels(Long projectId) {
        return labelRepository.findByProjectIdOrderByNameAsc(projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabelResponse createLabel(LabelRequest request) {
        if (labelRepository.existsByNameAndProjectId(request.getName(), request.getProjectId())) {
            throw new BadRequestException("Label with this name already exists in the project");
        }
        Project project = projectRepository.findByIdAndDeletedFalse(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        Label label = Label.builder()
                .name(request.getName())
                .color(request.getColor())
                .project(project)
                .build();

        labelRepository.save(label);
        return toResponse(label);
    }

    @Transactional
    public LabelResponse updateLabel(Long id, LabelRequest request) {
        Label label = labelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Label", "id", id));
        label.setName(request.getName());
        label.setColor(request.getColor());
        labelRepository.save(label);
        return toResponse(label);
    }

    @Transactional
    public void deleteLabel(Long id) {
        Label label = labelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Label", "id", id));
        label.getTasks().forEach(task -> task.getLabels().remove(label));
        labelRepository.delete(label);
    }

    private LabelResponse toResponse(Label label) {
        return LabelResponse.builder()
                .id(label.getId())
                .name(label.getName())
                .color(label.getColor())
                .projectId(label.getProject().getId())
                .taskCount(label.getTasks().size())
                .build();
    }
}
