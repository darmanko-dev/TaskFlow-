package com.taskflow.service;

import com.taskflow.dto.request.SavedFilterRequest;
import com.taskflow.dto.response.SavedFilterResponse;
import com.taskflow.entity.Project;
import com.taskflow.entity.SavedFilter;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.SavedFilterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedFilterService {

    private final SavedFilterRepository savedFilterRepository;
    private final ProjectRepository projectRepository;
    private final UserService userService;

    public List<SavedFilterResponse> getUserFilters() {
        User user = userService.getCurrentUserEntity();
        return savedFilterRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SavedFilterResponse> getProjectFilters(Long projectId) {
        User user = userService.getCurrentUserEntity();
        return savedFilterRepository.findAccessibleFilters(user.getId(), projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SavedFilterResponse createFilter(SavedFilterRequest request) {
        User user = userService.getCurrentUserEntity();
        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findByIdAndDeletedFalse(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));
        }

        SavedFilter filter = SavedFilter.builder()
                .name(request.getName())
                .filterJson(request.getFilterJson())
                .user(user)
                .project(project)
                .shared(request.isShared())
                .build();

        savedFilterRepository.save(filter);
        return toResponse(filter);
    }

    @Transactional
    public SavedFilterResponse updateFilter(Long id, SavedFilterRequest request) {
        SavedFilter filter = savedFilterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavedFilter", "id", id));
        filter.setName(request.getName());
        filter.setFilterJson(request.getFilterJson());
        filter.setShared(request.isShared());
        savedFilterRepository.save(filter);
        return toResponse(filter);
    }

    @Transactional
    public void deleteFilter(Long id) {
        SavedFilter filter = savedFilterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SavedFilter", "id", id));
        savedFilterRepository.delete(filter);
    }

    private SavedFilterResponse toResponse(SavedFilter filter) {
        return SavedFilterResponse.builder()
                .id(filter.getId())
                .name(filter.getName())
                .filterJson(filter.getFilterJson())
                .userId(filter.getUser().getId())
                .userName(filter.getUser().getFullName())
                .projectId(filter.getProject() != null ? filter.getProject().getId() : null)
                .shared(filter.isShared())
                .createdAt(filter.getCreatedAt())
                .build();
    }
}
