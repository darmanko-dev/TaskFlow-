package com.taskflow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@taskflow.com");
            message.setTo(to);
            message.setSubject("[TaskFlow] " + subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendTaskAssignedEmail(String to, String assignerName, String taskKey, String taskTitle) {
        String subject = "Task Assigned: " + taskKey;
        String body = String.format(
                "Hello,\n\n%s assigned you a new task.\n\nTask: %s - %s\n\nView it in TaskFlow.\n\n- TaskFlow Team",
                assignerName, taskKey, taskTitle
        );
        sendEmail(to, subject, body);
    }

    public void sendCommentNotificationEmail(String to, String authorName, String taskKey, String commentPreview) {
        String subject = "New Comment on " + taskKey;
        String body = String.format(
                "Hello,\n\n%s commented on %s:\n\n\"%s\"\n\nView it in TaskFlow.\n\n- TaskFlow Team",
                authorName, taskKey, commentPreview
        );
        sendEmail(to, subject, body);
    }

    public void sendMentionEmail(String to, String mentionerName, String taskKey) {
        String subject = "You were mentioned in " + taskKey;
        String body = String.format(
                "Hello,\n\n%s mentioned you in %s.\n\nView it in TaskFlow.\n\n- TaskFlow Team",
                mentionerName, taskKey
        );
        sendEmail(to, subject, body);
    }

    public void sendDueDateReminderEmail(String to, String taskKey, String taskTitle, String dueDate) {
        String subject = "Task Due Soon: " + taskKey;
        String body = String.format(
                "Hello,\n\nReminder: Task %s - %s is due on %s.\n\nView it in TaskFlow.\n\n- TaskFlow Team",
                taskKey, taskTitle, dueDate
        );
        sendEmail(to, subject, body);
    }
}
