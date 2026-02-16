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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutomationService {

    private final AutomationRuleRepository automationRuleRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public List<AutomationRuleResponse> getProjectRules(Long projectId) {
        return automationRuleRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AutomationRuleResponse createRule(AutomationRuleRequest request) {
        Project project = projectRepository.findByIdAndDeletedFalse(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        AutomationRule rule = AutomationRule.builder()
                .name(request.getName())
                .description(request.getDescription())
                .triggerType(request.getTriggerType())
                .triggerConfig(request.getTriggerConfig())
                .actionType(request.getActionType())
                .actionConfig(request.getActionConfig())
                .project(project)
                .enabled(request.isEnabled())
                .build();

        automationRuleRepository.save(rule);
        return toResponse(rule);
    }

    @Transactional
    public AutomationRuleResponse updateRule(Long id, AutomationRuleRequest request) {
        AutomationRule rule = automationRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AutomationRule", "id", id));
        rule.setName(request.getName());
        rule.setDescription(request.getDescription());
        rule.setTriggerType(request.getTriggerType());
        rule.setTriggerConfig(request.getTriggerConfig());
        rule.setActionType(request.getActionType());
        rule.setActionConfig(request.getActionConfig());
        rule.setEnabled(request.isEnabled());
        automationRuleRepository.save(rule);
        return toResponse(rule);
    }

    @Transactional
    public void toggleRule(Long id, boolean enabled) {
        AutomationRule rule = automationRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AutomationRule", "id", id));
        rule.setEnabled(enabled);
        automationRuleRepository.save(rule);
    }

    @Transactional
    public void deleteRule(Long id) {
        AutomationRule rule = automationRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AutomationRule", "id", id));
        automationRuleRepository.delete(rule);
    }

    @Transactional
    public void executeAutomations(String triggerType, Task task, String oldValue, String newValue) {
        List<AutomationRule> rules = automationRuleRepository
                .findByTriggerTypeAndProjectIdAndEnabledTrue(triggerType, task.getProject().getId());

        for (AutomationRule rule : rules) {
            try {
                if (matchesTrigger(rule, oldValue, newValue)) {
                    executeAction(rule, task);
                }
            } catch (Exception e) {
                log.error("Error executing automation rule {}: {}", rule.getId(), e.getMessage());
            }
        }
    }

    private boolean matchesTrigger(AutomationRule rule, String oldValue, String newValue) {
        try {
            JsonNode config = objectMapper.readTree(rule.getTriggerConfig());
            String fromStatus = config.has("fromStatus") ? config.get("fromStatus").asText() : null;
            String toStatus = config.has("toStatus") ? config.get("toStatus").asText() : null;

            if (fromStatus != null && !fromStatus.equals(oldValue)) return false;
            if (toStatus != null && !toStatus.equals(newValue)) return false;
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void executeAction(AutomationRule rule, Task task) {
        try {
            JsonNode config = objectMapper.readTree(rule.getActionConfig());
            switch (rule.getActionType()) {
                case "CHANGE_STATUS":
                    String newStatus = config.get("status").asText();
                    task.setStatus(TaskStatus.valueOf(newStatus));
                    taskRepository.save(task);
                    break;
                case "ASSIGN_TO":
                    Long userId = config.get("userId").asLong();
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        task.setAssignee(user);
                        taskRepository.save(task);
                    }
                    break;
                case "SEND_NOTIFICATION":
                    String title = config.has("title") ? config.get("title").asText() : "Automation";
                    String message = config.has("message") ? config.get("message").asText() : rule.getName();
                    if (task.getAssignee() != null) {
                        notificationService.sendNotification(task.getAssignee().getId(),
                                "AUTOMATION", title, message, "TASK", task.getId());
                    }
                    break;
            }
        } catch (Exception e) {
            log.error("Error executing action for rule {}: {}", rule.getId(), e.getMessage());
        }
    }

    private AutomationRuleResponse toResponse(AutomationRule rule) {
        return AutomationRuleResponse.builder()
                .id(rule.getId())
                .name(rule.getName())
                .description(rule.getDescription())
                .triggerType(rule.getTriggerType())
                .triggerConfig(rule.getTriggerConfig())
                .actionType(rule.getActionType())
                .actionConfig(rule.getActionConfig())
                .projectId(rule.getProject().getId())
                .enabled(rule.isEnabled())
                .createdAt(rule.getCreatedAt())
                .build();
    }
}
