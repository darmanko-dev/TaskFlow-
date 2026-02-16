package com.taskflow.service;

import com.taskflow.dto.request.TaskLinkRequest;
import com.taskflow.dto.response.TaskLinkResponse;
import com.taskflow.entity.Project;
import com.taskflow.entity.Task;
import com.taskflow.entity.TaskLink;
import com.taskflow.enums.LinkType;
import com.taskflow.exception.BadRequestException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.TaskLinkRepository;
import com.taskflow.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskLinkServiceTest {

    @Mock
    private TaskLinkRepository taskLinkRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private TaskLinkService taskLinkService;

    private Project project;
    private Task sourceTask;
    private Task targetTask;
    private TaskLink taskLink;
    private TaskLinkRequest linkRequest;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .name("Test Project")
                .key("TP")
                .build();

        sourceTask = Task.builder()
                .id(100L)
                .taskKey("TP-1")
                .title("Source Task")
                .project(project)
                .build();

        targetTask = Task.builder()
                .id(200L)
                .taskKey("TP-2")
                .title("Target Task")
                .project(project)
                .build();

        taskLink = TaskLink.builder()
                .id(1L)
                .sourceTask(sourceTask)
                .targetTask(targetTask)
                .linkType(LinkType.BLOCKS)
                .createdAt(LocalDateTime.now())
                .build();

        linkRequest = new TaskLinkRequest();
        linkRequest.setSourceTaskId(100L);
        linkRequest.setTargetTaskId(200L);
        linkRequest.setLinkType(LinkType.BLOCKS);
    }

    @Nested
    @DisplayName("getTaskLinks")
    class GetTaskLinks {

        @Test
        @DisplayName("should return all links for a task")
        void shouldReturnAllLinksForTask() {
            TaskLink link2 = TaskLink.builder()
                    .id(2L)
                    .sourceTask(sourceTask)
                    .targetTask(Task.builder().id(300L).taskKey("TP-3").title("Another Task").build())
                    .linkType(LinkType.RELATES_TO)
                    .createdAt(LocalDateTime.now())
                    .build();

            when(taskLinkRepository.findByTaskId(100L)).thenReturn(List.of(taskLink, link2));

            List<TaskLinkResponse> result = taskLinkService.getTaskLinks(100L);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getSourceTaskId()).isEqualTo(100L);
            assertThat(result.get(0).getTargetTaskId()).isEqualTo(200L);
            assertThat(result.get(0).getLinkType()).isEqualTo(LinkType.BLOCKS);
            assertThat(result.get(0).getSourceTaskKey()).isEqualTo("TP-1");
            assertThat(result.get(0).getTargetTaskKey()).isEqualTo("TP-2");
            assertThat(result.get(1).getLinkType()).isEqualTo(LinkType.RELATES_TO);
            verify(taskLinkRepository).findByTaskId(100L);
        }

        @Test
        @DisplayName("should return empty list when task has no links")
        void shouldReturnEmptyListWhenNoLinks() {
            when(taskLinkRepository.findByTaskId(100L)).thenReturn(Collections.emptyList());

            List<TaskLinkResponse> result = taskLinkService.getTaskLinks(100L);

            assertThat(result).isEmpty();
            verify(taskLinkRepository).findByTaskId(100L);
        }
    }

    @Nested
    @DisplayName("createLink")
    class CreateLink {

        @Test
        @DisplayName("should create link successfully between two different tasks")
        void shouldCreateLinkSuccessfully() {
            when(taskRepository.findById(100L)).thenReturn(Optional.of(sourceTask));
            when(taskRepository.findById(200L)).thenReturn(Optional.of(targetTask));
            when(taskLinkRepository.save(any(TaskLink.class))).thenAnswer(invocation -> {
                TaskLink saved = invocation.getArgument(0);
                saved.setId(1L);
                saved.setCreatedAt(LocalDateTime.now());
                return saved;
            });

            TaskLinkResponse result = taskLinkService.createLink(linkRequest);

            assertThat(result).isNotNull();
            assertThat(result.getSourceTaskId()).isEqualTo(100L);
            assertThat(result.getTargetTaskId()).isEqualTo(200L);
            assertThat(result.getLinkType()).isEqualTo(LinkType.BLOCKS);
            assertThat(result.getSourceTaskKey()).isEqualTo("TP-1");
            assertThat(result.getSourceTaskTitle()).isEqualTo("Source Task");
            assertThat(result.getTargetTaskKey()).isEqualTo("TP-2");
            assertThat(result.getTargetTaskTitle()).isEqualTo("Target Task");

            ArgumentCaptor<TaskLink> captor = ArgumentCaptor.forClass(TaskLink.class);
            verify(taskLinkRepository).save(captor.capture());
            TaskLink savedLink = captor.getValue();
            assertThat(savedLink.getSourceTask()).isEqualTo(sourceTask);
            assertThat(savedLink.getTargetTask()).isEqualTo(targetTask);
            assertThat(savedLink.getLinkType()).isEqualTo(LinkType.BLOCKS);
        }

        @Test
        @DisplayName("should log activity after creating link")
        void shouldLogActivityAfterCreatingLink() {
            when(taskRepository.findById(100L)).thenReturn(Optional.of(sourceTask));
            when(taskRepository.findById(200L)).thenReturn(Optional.of(targetTask));
            when(taskLinkRepository.save(any(TaskLink.class))).thenReturn(taskLink);

            taskLinkService.createLink(linkRequest);

            verify(activityLogService).log(
                    eq("LINKED"),
                    eq("TASK"),
                    eq(100L),
                    eq("TP-1"),
                    eq("TP-1 BLOCKS TP-2"),
                    eq(1L)
            );
        }

        @Test
        @DisplayName("should throw BadRequestException when linking task to itself")
        void shouldThrowWhenSelfLink() {
            TaskLinkRequest selfLinkRequest = new TaskLinkRequest();
            selfLinkRequest.setSourceTaskId(100L);
            selfLinkRequest.setTargetTaskId(100L);
            selfLinkRequest.setLinkType(LinkType.BLOCKS);

            assertThatThrownBy(() -> taskLinkService.createLink(selfLinkRequest))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Cannot link a task to itself");

            verify(taskRepository, never()).findById(anyLong());
            verify(taskLinkRepository, never()).save(any());
            verify(activityLogService, never()).log(
                    anyString(), anyString(), anyLong(), anyString(), anyString(), anyLong());
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when source task does not exist")
        void shouldThrowWhenSourceTaskNotFound() {
            when(taskRepository.findById(100L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskLinkService.createLink(linkRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Task");

            verify(taskLinkRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when target task does not exist")
        void shouldThrowWhenTargetTaskNotFound() {
            when(taskRepository.findById(100L)).thenReturn(Optional.of(sourceTask));
            when(taskRepository.findById(200L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskLinkService.createLink(linkRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Task");

            verify(taskLinkRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("deleteLink")
    class DeleteLink {

        @Test
        @DisplayName("should delete link successfully")
        void shouldDeleteLinkSuccessfully() {
            when(taskLinkRepository.findById(1L)).thenReturn(Optional.of(taskLink));

            taskLinkService.deleteLink(1L);

            verify(taskLinkRepository).delete(taskLink);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when link does not exist")
        void shouldThrowWhenLinkNotFound() {
            when(taskLinkRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskLinkService.deleteLink(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("TaskLink");

            verify(taskLinkRepository, never()).delete(any());
        }
    }
}
