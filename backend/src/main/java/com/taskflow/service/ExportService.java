package com.taskflow.service;

import com.taskflow.entity.Task;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final TaskRepository taskRepository;

    public byte[] exportTasksToCSV(Long projectId) {
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        writer.println("Key,Title,Status,Priority,Assignee,Reporter,Sprint,Epic,Story Points,Due Date,Estimated Hours,Logged Hours,Created At");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Task task : tasks) {
            writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",%.1f,%.1f,\"%s\"%n",
                    escape(task.getTaskKey()),
                    escape(task.getTitle()),
                    task.getStatus(),
                    task.getPriority(),
                    task.getAssignee() != null ? escape(task.getAssignee().getFullName()) : "",
                    escape(task.getReporter().getFullName()),
                    task.getSprint() != null ? escape(task.getSprint().getName()) : "",
                    task.getEpic() != null ? escape(task.getEpic().getName()) : "",
                    task.getStoryPoints() != null ? task.getStoryPoints() : 0,
                    task.getDueDate() != null ? task.getDueDate().format(df) : "",
                    task.getEstimatedHours(),
                    task.getLoggedHours(),
                    task.getCreatedAt() != null ? task.getCreatedAt().format(dtf) : ""
            );
        }

        writer.flush();
        return out.toByteArray();
    }

    public byte[] exportAllTasksToCSV() {
        List<Task> tasks = taskRepository.findAll();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        writer.println("Key,Title,Project,Status,Priority,Assignee,Reporter,Story Points,Due Date,Created At");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Task task : tasks) {
            writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",\"%s\"%n",
                    escape(task.getTaskKey()),
                    escape(task.getTitle()),
                    escape(task.getProject().getName()),
                    task.getStatus(),
                    task.getPriority(),
                    task.getAssignee() != null ? escape(task.getAssignee().getFullName()) : "",
                    escape(task.getReporter().getFullName()),
                    task.getStoryPoints() != null ? task.getStoryPoints() : 0,
                    task.getDueDate() != null ? task.getDueDate().format(df) : "",
                    task.getCreatedAt() != null ? task.getCreatedAt().format(dtf) : ""
            );
        }

        writer.flush();
        return out.toByteArray();
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
