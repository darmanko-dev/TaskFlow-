package com.taskflow.service;

import com.taskflow.dto.request.LabelRequest;
import com.taskflow.dto.response.LabelResponse;
import com.taskflow.entity.Label;
import com.taskflow.entity.Project;
import com.taskflow.entity.Task;
import com.taskflow.exception.BadRequestException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.LabelRepository;
import com.taskflow.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LabelServiceTest {

    @Mock
    private LabelRepository labelRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private LabelService labelService;

    private Project project;
    private Label label;
    private LabelRequest labelRequest;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .name("Test Project")
                .key("TP")
                .build();

        label = Label.builder()
                .id(10L)
                .name("Bug")
                .color("#FF0000")
                .project(project)
                .tasks(new HashSet<>())
                .build();

        labelRequest = new LabelRequest();
        labelRequest.setName("Bug");
        labelRequest.setColor("#FF0000");
        labelRequest.setProjectId(1L);
    }

    @Nested
    @DisplayName("getProjectLabels")
    class GetProjectLabels {

        @Test
        @DisplayName("should return all labels for a project")
        void shouldReturnAllLabelsForProject() {
            Label label2 = Label.builder()
                    .id(11L)
                    .name("Feature")
                    .color("#00FF00")
                    .project(project)
                    .tasks(new HashSet<>())
                    .build();

            when(labelRepository.findByProjectIdOrderByNameAsc(1L))
                    .thenReturn(List.of(label, label2));

            List<LabelResponse> result = labelService.getProjectLabels(1L);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getName()).isEqualTo("Bug");
            assertThat(result.get(0).getColor()).isEqualTo("#FF0000");
            assertThat(result.get(0).getProjectId()).isEqualTo(1L);
            assertThat(result.get(1).getName()).isEqualTo("Feature");
            verify(labelRepository).findByProjectIdOrderByNameAsc(1L);
        }

        @Test
        @DisplayName("should return empty list when project has no labels")
        void shouldReturnEmptyListWhenNoLabels() {
            when(labelRepository.findByProjectIdOrderByNameAsc(1L))
                    .thenReturn(Collections.emptyList());

            List<LabelResponse> result = labelService.getProjectLabels(1L);

            assertThat(result).isEmpty();
            verify(labelRepository).findByProjectIdOrderByNameAsc(1L);
        }

        @Test
        @DisplayName("should include correct task count in response")
        void shouldIncludeCorrectTaskCount() {
            Task task1 = Task.builder().id(100L).build();
            Task task2 = Task.builder().id(101L).build();
            label.setTasks(Set.of(task1, task2));

            when(labelRepository.findByProjectIdOrderByNameAsc(1L))
                    .thenReturn(List.of(label));

            List<LabelResponse> result = labelService.getProjectLabels(1L);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTaskCount()).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("createLabel")
    class CreateLabel {

        @Test
        @DisplayName("should create label successfully")
        void shouldCreateLabelSuccessfully() {
            when(labelRepository.existsByNameAndProjectId("Bug", 1L)).thenReturn(false);
            when(projectRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(project));
            when(labelRepository.save(any(Label.class))).thenAnswer(invocation -> {
                Label saved = invocation.getArgument(0);
                saved.setId(10L);
                return saved;
            });

            LabelResponse result = labelService.createLabel(labelRequest);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Bug");
            assertThat(result.getColor()).isEqualTo("#FF0000");
            assertThat(result.getProjectId()).isEqualTo(1L);

            ArgumentCaptor<Label> captor = ArgumentCaptor.forClass(Label.class);
            verify(labelRepository).save(captor.capture());
            Label savedLabel = captor.getValue();
            assertThat(savedLabel.getName()).isEqualTo("Bug");
            assertThat(savedLabel.getColor()).isEqualTo("#FF0000");
            assertThat(savedLabel.getProject()).isEqualTo(project);
        }

        @Test
        @DisplayName("should throw BadRequestException when label name already exists in project")
        void shouldThrowWhenDuplicateLabelName() {
            when(labelRepository.existsByNameAndProjectId("Bug", 1L)).thenReturn(true);

            assertThatThrownBy(() -> labelService.createLabel(labelRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Label with this name already exists");

            verify(labelRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when project does not exist")
        void shouldThrowWhenProjectNotFound() {
            when(labelRepository.existsByNameAndProjectId("Bug", 1L)).thenReturn(false);
            when(projectRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> labelService.createLabel(labelRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Project");

            verify(labelRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("deleteLabel")
    class DeleteLabel {

        @Test
        @DisplayName("should delete label and remove it from associated tasks")
        void shouldDeleteLabelAndRemoveFromTasks() {
            Set<Label> taskLabels = new HashSet<>();
            taskLabels.add(label);
            Task task = Task.builder().id(100L).labels(taskLabels).build();
            label.setTasks(Set.of(task));

            when(labelRepository.findById(10L)).thenReturn(Optional.of(label));

            labelService.deleteLabel(10L);

            assertThat(task.getLabels()).doesNotContain(label);
            verify(labelRepository).delete(label);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when label does not exist")
        void shouldThrowWhenLabelNotFound() {
            when(labelRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> labelService.deleteLabel(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Label");

            verify(labelRepository, never()).delete(any());
        }

        @Test
        @DisplayName("should delete label with no associated tasks")
        void shouldDeleteLabelWithNoTasks() {
            label.setTasks(new HashSet<>());
            when(labelRepository.findById(10L)).thenReturn(Optional.of(label));

            labelService.deleteLabel(10L);

            verify(labelRepository).delete(label);
        }
    }
}
