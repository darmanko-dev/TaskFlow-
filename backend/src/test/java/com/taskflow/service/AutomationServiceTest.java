package com.taskflow.service;

import com.taskflow.dto.request.AutomationRuleRequest;
import com.taskflow.dto.response.AutomationRuleResponse;
import com.taskflow.entity.AutomationRule;
import com.taskflow.entity.Project;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.enums.TaskStatus;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.AutomationRuleRepository;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutomationServiceTest {

    @Mock
    private AutomationRuleRepository automationRuleRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AutomationService automationService;

    private Project project;
    private AutomationRule rule;
    private AutomationRuleRequest ruleRequest;
    private Task task;
    private User assignee;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .name("Test Project")
                .key("TP")
                .build();

        assignee = User.builder()
                .id(50L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .build();

        task = Task.builder()
                .id(100L)
                .taskKey("TP-1")
                .title("Test Task")
                .status(TaskStatus.TODO)
                .project(project)
                .assignee(assignee)
                .build();

        rule = AutomationRule.builder()
                .id(10L)
                .name("Auto close on done")
                .description("Changes status when moved to done")
                .triggerType("STATUS_CHANGED")
                .triggerConfig("{\"fromStatus\":\"IN_PROGRESS\",\"toStatus\":\"DONE\"}")
                .actionType("SEND_NOTIFICATION")
                .actionConfig("{\"title\":\"Task Done\",\"message\":\"Task completed\"}")
                .project(project)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        ruleRequest = new AutomationRuleRequest();
        ruleRequest.setName("Auto close on done");
        ruleRequest.setDescription("Changes status when moved to done");
        ruleRequest.setTriggerType("STATUS_CHANGED");
        ruleRequest.setTriggerConfig("{\"fromStatus\":\"IN_PROGRESS\",\"toStatus\":\"DONE\"}");
        ruleRequest.setActionType("SEND_NOTIFICATION");
        ruleRequest.setActionConfig("{\"title\":\"Task Done\",\"message\":\"Task completed\"}");
        ruleRequest.setProjectId(1L);
        ruleRequest.setEnabled(true);
    }

    @Nested
    @DisplayName("getProjectRules")
    class GetProjectRules {

        @Test
        @DisplayName("should return all rules for a project")
        void shouldReturnAllRulesForProject() {
            AutomationRule rule2 = AutomationRule.builder()
                    .id(11L)
                    .name("Auto assign")
                    .triggerType("TASK_CREATED")
                    .triggerConfig("{}")
                    .actionType("ASSIGN_TO")
                    .actionConfig("{\"userId\":50}")
                    .project(project)
                    .enabled(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            when(automationRuleRepository.findByProjectIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(rule, rule2));

            List<AutomationRuleResponse> result = automationService.getProjectRules(1L);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getName()).isEqualTo("Auto close on done");
            assertThat(result.get(0).getTriggerType()).isEqualTo("STATUS_CHANGED");
            assertThat(result.get(0).getActionType()).isEqualTo("SEND_NOTIFICATION");
            assertThat(result.get(0).isEnabled()).isTrue();
            assertThat(result.get(0).getProjectId()).isEqualTo(1L);
            assertThat(result.get(1).getName()).isEqualTo("Auto assign");
            assertThat(result.get(1).isEnabled()).isFalse();
            verify(automationRuleRepository).findByProjectIdOrderByCreatedAtDesc(1L);
        }

        @Test
        @DisplayName("should return empty list when project has no rules")
        void shouldReturnEmptyListWhenNoRules() {
            when(automationRuleRepository.findByProjectIdOrderByCreatedAtDesc(1L))
                    .thenReturn(Collections.emptyList());

            List<AutomationRuleResponse> result = automationService.getProjectRules(1L);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("createRule")
    class CreateRule {

        @Test
        @DisplayName("should create automation rule successfully")
        void shouldCreateRuleSuccessfully() {
            when(projectRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(project));
            when(automationRuleRepository.save(any(AutomationRule.class))).thenAnswer(invocation -> {
                AutomationRule saved = invocation.getArgument(0);
                saved.setId(10L);
                saved.setCreatedAt(LocalDateTime.now());
                return saved;
            });

            AutomationRuleResponse result = automationService.createRule(ruleRequest);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Auto close on done");
            assertThat(result.getDescription()).isEqualTo("Changes status when moved to done");
            assertThat(result.getTriggerType()).isEqualTo("STATUS_CHANGED");
            assertThat(result.getActionType()).isEqualTo("SEND_NOTIFICATION");
            assertThat(result.isEnabled()).isTrue();
            assertThat(result.getProjectId()).isEqualTo(1L);

            ArgumentCaptor<AutomationRule> captor = ArgumentCaptor.forClass(AutomationRule.class);
            verify(automationRuleRepository).save(captor.capture());
            AutomationRule savedRule = captor.getValue();
            assertThat(savedRule.getName()).isEqualTo("Auto close on done");
            assertThat(savedRule.getProject()).isEqualTo(project);
            assertThat(savedRule.getTriggerConfig()).isEqualTo("{\"fromStatus\":\"IN_PROGRESS\",\"toStatus\":\"DONE\"}");
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when project does not exist")
        void shouldThrowWhenProjectNotFound() {
            when(projectRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> automationService.createRule(ruleRequest))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Project");

            verify(automationRuleRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("toggleRule")
    class ToggleRule {

        @Test
        @DisplayName("should enable a disabled rule")
        void shouldEnableRule() {
            rule.setEnabled(false);
            when(automationRuleRepository.findById(10L)).thenReturn(Optional.of(rule));
            when(automationRuleRepository.save(any(AutomationRule.class))).thenReturn(rule);

            automationService.toggleRule(10L, true);

            assertThat(rule.isEnabled()).isTrue();
            verify(automationRuleRepository).save(rule);
        }

        @Test
        @DisplayName("should disable an enabled rule")
        void shouldDisableRule() {
            rule.setEnabled(true);
            when(automationRuleRepository.findById(10L)).thenReturn(Optional.of(rule));
            when(automationRuleRepository.save(any(AutomationRule.class))).thenReturn(rule);

            automationService.toggleRule(10L, false);

            assertThat(rule.isEnabled()).isFalse();
            verify(automationRuleRepository).save(rule);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when rule does not exist")
        void shouldThrowWhenRuleNotFound() {
            when(automationRuleRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> automationService.toggleRule(999L, true))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("AutomationRule");

            verify(automationRuleRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("executeAutomations")
    class ExecuteAutomations {

        @Test
        @DisplayName("should execute SEND_NOTIFICATION action when STATUS_CHANGED trigger matches")
        void shouldExecuteSendNotificationWhenTriggerMatches() {
            when(automationRuleRepository.findByTriggerTypeAndProjectIdAndEnabledTrue("STATUS_CHANGED", 1L))
                    .thenReturn(List.of(rule));

            automationService.executeAutomations("STATUS_CHANGED", task, "IN_PROGRESS", "DONE");

            verify(notificationService).sendNotification(
                    eq(50L),
                    eq("AUTOMATION"),
                    eq("Task Done"),
                    eq("Task completed"),
                    eq("TASK"),
                    eq(100L)
            );
        }

        @Test
        @DisplayName("should execute CHANGE_STATUS action when trigger matches")
        void shouldExecuteChangeStatusAction() {
            AutomationRule statusRule = AutomationRule.builder()
                    .id(20L)
                    .name("Auto move to review")
                    .triggerType("STATUS_CHANGED")
                    .triggerConfig("{\"fromStatus\":\"TODO\",\"toStatus\":\"IN_PROGRESS\"}")
                    .actionType("CHANGE_STATUS")
                    .actionConfig("{\"status\":\"IN_REVIEW\"}")
                    .project(project)
                    .enabled(true)
                    .build();

            when(automationRuleRepository.findByTriggerTypeAndProjectIdAndEnabledTrue("STATUS_CHANGED", 1L))
                    .thenReturn(List.of(statusRule));

            automationService.executeAutomations("STATUS_CHANGED", task, "TODO", "IN_PROGRESS");

            assertThat(task.getStatus()).isEqualTo(TaskStatus.IN_REVIEW);
            verify(taskRepository).save(task);
        }

        @Test
        @DisplayName("should execute ASSIGN_TO action when trigger matches")
        void shouldExecuteAssignToAction() {
            User newAssignee = User.builder()
                    .id(60L)
                    .firstName("Jane")
                    .lastName("Smith")
                    .build();

            AutomationRule assignRule = AutomationRule.builder()
                    .id(21L)
                    .name("Auto assign to Jane")
                    .triggerType("STATUS_CHANGED")
                    .triggerConfig("{\"toStatus\":\"IN_REVIEW\"}")
                    .actionType("ASSIGN_TO")
                    .actionConfig("{\"userId\":60}")
                    .project(project)
                    .enabled(true)
                    .build();

            when(automationRuleRepository.findByTriggerTypeAndProjectIdAndEnabledTrue("STATUS_CHANGED", 1L))
                    .thenReturn(List.of(assignRule));
            when(userRepository.findById(60L)).thenReturn(Optional.of(newAssignee));

            automationService.executeAutomations("STATUS_CHANGED", task, "IN_PROGRESS", "IN_REVIEW");

            assertThat(task.getAssignee()).isEqualTo(newAssignee);
            verify(taskRepository).save(task);
        }

        @Test
        @DisplayName("should not execute action when trigger does not match fromStatus")
        void shouldNotExecuteWhenFromStatusDoesNotMatch() {
            when(automationRuleRepository.findByTriggerTypeAndProjectIdAndEnabledTrue("STATUS_CHANGED", 1L))
                    .thenReturn(List.of(rule));

            automationService.executeAutomations("STATUS_CHANGED", task, "TODO", "DONE");

            verify(notificationService, never()).sendNotification(
                    anyLong(), anyString(), anyString(), anyString(), anyString(), anyLong());
        }

        @Test
        @DisplayName("should not execute action when trigger does not match toStatus")
        void shouldNotExecuteWhenToStatusDoesNotMatch() {
            when(automationRuleRepository.findByTriggerTypeAndProjectIdAndEnabledTrue("STATUS_CHANGED", 1L))
                    .thenReturn(List.of(rule));

            automationService.executeAutomations("STATUS_CHANGED", task, "IN_PROGRESS", "IN_REVIEW");

            verify(notificationService, never()).sendNotification(
                    anyLong(), anyString(), anyString(), anyString(), anyString(), anyLong());
        }

        @Test
        @DisplayName("should not send notification when task has no assignee")
        void shouldNotSendNotificationWhenNoAssignee() {
            task.setAssignee(null);

            when(automationRuleRepository.findByTriggerTypeAndProjectIdAndEnabledTrue("STATUS_CHANGED", 1L))
                    .thenReturn(List.of(rule));

            automationService.executeAutomations("STATUS_CHANGED", task, "IN_PROGRESS", "DONE");

            verify(notificationService, never()).sendNotification(
                    anyLong(), anyString(), anyString(), anyString(), anyString(), anyLong());
        }

        @Test
        @DisplayName("should handle no matching rules gracefully")
        void shouldHandleNoMatchingRules() {
            when(automationRuleRepository.findByTriggerTypeAndProjectIdAndEnabledTrue("STATUS_CHANGED", 1L))
                    .thenReturn(Collections.emptyList());

            automationService.executeAutomations("STATUS_CHANGED", task, "IN_PROGRESS", "DONE");

            verify(notificationService, never()).sendNotification(
                    anyLong(), anyString(), anyString(), anyString(), anyString(), anyLong());
            verify(taskRepository, never()).save(any());
        }

        @Test
        @DisplayName("should execute multiple matching rules")
        void shouldExecuteMultipleMatchingRules() {
            AutomationRule statusRule = AutomationRule.builder()
                    .id(20L)
                    .name("Also change status")
                    .triggerType("STATUS_CHANGED")
                    .triggerConfig("{\"fromStatus\":\"IN_PROGRESS\",\"toStatus\":\"DONE\"}")
                    .actionType("CHANGE_STATUS")
                    .actionConfig("{\"status\":\"DONE\"}")
                    .project(project)
                    .enabled(true)
                    .build();

            when(automationRuleRepository.findByTriggerTypeAndProjectIdAndEnabledTrue("STATUS_CHANGED", 1L))
                    .thenReturn(List.of(rule, statusRule));

            automationService.executeAutomations("STATUS_CHANGED", task, "IN_PROGRESS", "DONE");

            verify(notificationService).sendNotification(
                    eq(50L), eq("AUTOMATION"), eq("Task Done"), eq("Task completed"), eq("TASK"), eq(100L));
            verify(taskRepository).save(task);
        }

        @Test
        @DisplayName("should match trigger with only toStatus configured")
        void shouldMatchTriggerWithOnlyToStatus() {
            AutomationRule toOnlyRule = AutomationRule.builder()
                    .id(22L)
                    .name("Notify on DONE")
                    .triggerType("STATUS_CHANGED")
                    .triggerConfig("{\"toStatus\":\"DONE\"}")
                    .actionType("SEND_NOTIFICATION")
                    .actionConfig("{\"title\":\"Done!\",\"message\":\"Completed\"}")
                    .project(project)
                    .enabled(true)
                    .build();

            when(automationRuleRepository.findByTriggerTypeAndProjectIdAndEnabledTrue("STATUS_CHANGED", 1L))
                    .thenReturn(List.of(toOnlyRule));

            automationService.executeAutomations("STATUS_CHANGED", task, "TODO", "DONE");

            verify(notificationService).sendNotification(
                    eq(50L), eq("AUTOMATION"), eq("Done!"), eq("Completed"), eq("TASK"), eq(100L));
        }
    }
}
