package com.taskflow.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.MailSendException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Nested
    @DisplayName("sendEmail")
    class SendEmail {

        @Test
        @DisplayName("should send email with correct fields")
        void shouldSendEmailWithCorrectFields() {
            emailService.sendEmail("user@example.com", "Test Subject", "Test body content");

            ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            verify(mailSender).send(captor.capture());

            SimpleMailMessage message = captor.getValue();
            assertThat(message.getFrom()).isEqualTo("noreply@taskflow.com");
            assertThat(message.getTo()).containsExactly("user@example.com");
            assertThat(message.getSubject()).isEqualTo("[TaskFlow] Test Subject");
            assertThat(message.getText()).isEqualTo("Test body content");
        }

        @Test
        @DisplayName("should prepend [TaskFlow] to subject")
        void shouldPrependTaskFlowToSubject() {
            emailService.sendEmail("user@example.com", "Important Update", "Body");

            ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            verify(mailSender).send(captor.capture());

            assertThat(captor.getValue().getSubject()).isEqualTo("[TaskFlow] Important Update");
        }

        @Test
        @DisplayName("should not throw when mail sender fails")
        void shouldNotThrowWhenMailSenderFails() {
            doThrow(new MailSendException("SMTP server unavailable"))
                    .when(mailSender).send(any(SimpleMailMessage.class));

            // Should not throw - the service catches exceptions and logs them
            emailService.sendEmail("user@example.com", "Subject", "Body");

            verify(mailSender).send(any(SimpleMailMessage.class));
        }
    }

    @Nested
    @DisplayName("sendTaskAssignedEmail")
    class SendTaskAssignedEmail {

        @Test
        @DisplayName("should send task assigned email with correct subject and body")
        void shouldSendTaskAssignedEmailCorrectly() {
            emailService.sendTaskAssignedEmail("dev@example.com", "Alice Johnson", "TP-42", "Fix login bug");

            ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            verify(mailSender).send(captor.capture());

            SimpleMailMessage message = captor.getValue();
            assertThat(message.getTo()).containsExactly("dev@example.com");
            assertThat(message.getSubject()).isEqualTo("[TaskFlow] Task Assigned: TP-42");
            assertThat(message.getText()).contains("Alice Johnson assigned you a new task");
            assertThat(message.getText()).contains("TP-42 - Fix login bug");
            assertThat(message.getText()).contains("TaskFlow Team");
        }

        @Test
        @DisplayName("should include task key and title in body")
        void shouldIncludeTaskKeyAndTitle() {
            emailService.sendTaskAssignedEmail("dev@example.com", "Bob", "PROJ-100", "Implement feature X");

            ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            verify(mailSender).send(captor.capture());

            String body = captor.getValue().getText();
            assertThat(body).contains("PROJ-100");
            assertThat(body).contains("Implement feature X");
            assertThat(body).contains("Bob assigned you a new task");
        }
    }

    @Nested
    @DisplayName("sendDueDateReminderEmail")
    class SendDueDateReminderEmail {

        @Test
        @DisplayName("should send due date reminder with correct subject and body")
        void shouldSendDueDateReminderCorrectly() {
            emailService.sendDueDateReminderEmail("dev@example.com", "TP-5", "Deploy release", "2025-07-01");

            ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            verify(mailSender).send(captor.capture());

            SimpleMailMessage message = captor.getValue();
            assertThat(message.getTo()).containsExactly("dev@example.com");
            assertThat(message.getSubject()).isEqualTo("[TaskFlow] Task Due Soon: TP-5");
            assertThat(message.getText()).contains("TP-5 - Deploy release");
            assertThat(message.getText()).contains("due on 2025-07-01");
            assertThat(message.getText()).contains("TaskFlow Team");
        }

        @Test
        @DisplayName("should include reminder wording in body")
        void shouldIncludeReminderWording() {
            emailService.sendDueDateReminderEmail("user@test.com", "ABC-1", "Review PR", "2025-12-31");

            ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            verify(mailSender).send(captor.capture());

            String body = captor.getValue().getText();
            assertThat(body).contains("Reminder:");
            assertThat(body).contains("ABC-1 - Review PR");
            assertThat(body).contains("2025-12-31");
        }
    }

    @Nested
    @DisplayName("sendCommentNotificationEmail")
    class SendCommentNotificationEmail {

        @Test
        @DisplayName("should send comment notification with correct content")
        void shouldSendCommentNotificationCorrectly() {
            emailService.sendCommentNotificationEmail("dev@example.com", "Jane Doe", "TP-10", "Looks good to me!");

            ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            verify(mailSender).send(captor.capture());

            SimpleMailMessage message = captor.getValue();
            assertThat(message.getTo()).containsExactly("dev@example.com");
            assertThat(message.getSubject()).isEqualTo("[TaskFlow] New Comment on TP-10");
            assertThat(message.getText()).contains("Jane Doe commented on TP-10");
            assertThat(message.getText()).contains("Looks good to me!");
        }
    }

    @Nested
    @DisplayName("sendMentionEmail")
    class SendMentionEmail {

        @Test
        @DisplayName("should send mention email with correct content")
        void shouldSendMentionEmailCorrectly() {
            emailService.sendMentionEmail("dev@example.com", "Charlie", "TP-7");

            ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
            verify(mailSender).send(captor.capture());

            SimpleMailMessage message = captor.getValue();
            assertThat(message.getTo()).containsExactly("dev@example.com");
            assertThat(message.getSubject()).isEqualTo("[TaskFlow] You were mentioned in TP-7");
            assertThat(message.getText()).contains("Charlie mentioned you in TP-7");
        }
    }
}
