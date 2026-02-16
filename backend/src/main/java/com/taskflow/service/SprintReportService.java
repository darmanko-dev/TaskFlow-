package com.taskflow.service;

import com.taskflow.dto.response.SprintReportResponse;
import com.taskflow.entity.Sprint;
import com.taskflow.entity.Task;
import com.taskflow.enums.TaskStatus;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.SprintRepository;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintReportService {

    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;

    public SprintReportResponse getSprintReport(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));

        List<Task> tasks = taskRepository.findBySprintId(sprintId);

        int totalTasks = tasks.size();
        int completedTasks = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        int committedPoints = tasks.stream().mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();
        int completedPoints = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();

        Map<String, Integer> tasksByStatus = new LinkedHashMap<>();
        for (TaskStatus status : TaskStatus.values()) {
            tasksByStatus.put(status.name(), (int) tasks.stream().filter(t -> t.getStatus() == status).count());
        }

        Map<String, Integer> tasksByPriority = tasks.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getPriority().name(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        List<Map<String, Object>> burndownData = generateBurndownData(sprint, tasks);

        double velocity = completedPoints;

        return SprintReportResponse.builder()
                .sprintId(sprint.getId())
                .sprintName(sprint.getName())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .committedPoints(committedPoints)
                .completedPoints(completedPoints)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .addedDuringSprint(0)
                .removedDuringSprint(0)
                .burndownData(burndownData)
                .tasksByStatus(tasksByStatus)
                .tasksByPriority(tasksByPriority)
                .velocity(velocity)
                .build();
    }

    public double getTeamVelocity(Long projectId, int lastNSprints) {
        List<Sprint> sprints = sprintRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        List<Sprint> completedSprints = sprints.stream()
                .filter(s -> "COMPLETED".equals(s.getStatus().name()))
                .limit(lastNSprints)
                .collect(Collectors.toList());

        if (completedSprints.isEmpty()) return 0;

        double totalPoints = 0;
        for (Sprint sprint : completedSprints) {
            List<Task> tasks = taskRepository.findBySprintId(sprint.getId());
            totalPoints += tasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                    .sum();
        }

        return totalPoints / completedSprints.size();
    }

    private List<Map<String, Object>> generateBurndownData(Sprint sprint, List<Task> tasks) {
        List<Map<String, Object>> data = new ArrayList<>();

        LocalDate startDate = sprint.getStartDate();
        LocalDate endDate = sprint.getEndDate();
        if (startDate == null || endDate == null) return data;

        int totalPoints = tasks.stream()
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double idealBurnPerDay = totalDays > 0 ? (double) totalPoints / totalDays : 0;

        LocalDate currentDate = startDate;
        LocalDate today = LocalDate.now();
        int remainingPoints = totalPoints;

        while (!currentDate.isAfter(endDate)) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", currentDate.toString());
            point.put("ideal", Math.max(0, totalPoints - idealBurnPerDay * ChronoUnit.DAYS.between(startDate, currentDate)));

            if (!currentDate.isAfter(today)) {
                final LocalDate checkDate = currentDate;
                int completedByDate = tasks.stream()
                        .filter(t -> t.getStatus() == TaskStatus.DONE && t.getUpdatedAt() != null
                                && !t.getUpdatedAt().toLocalDate().isAfter(checkDate))
                        .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                        .sum();
                point.put("actual", totalPoints - completedByDate);
            }

            data.add(point);
            currentDate = currentDate.plusDays(1);
        }

        return data;
    }
}
