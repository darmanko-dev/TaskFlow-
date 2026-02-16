package com.taskflow.service;

import com.taskflow.dto.request.CommentRequest;
import com.taskflow.dto.response.CommentResponse;
import com.taskflow.entity.Comment;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.mapper.CommentMapper;
import com.taskflow.repository.CommentRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final CommentMapper commentMapper;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    private static final Pattern MENTION_PATTERN = Pattern.compile("@(\\S+@\\S+)");

    public List<CommentResponse> getCommentsByTaskId(Long taskId) {
        return commentMapper.toResponseList(commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId));
    }

    @Transactional
    public CommentResponse createComment(Long taskId, CommentRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        User author = userService.getCurrentUserEntity();

        Comment comment = Comment.builder()
                .content(request.getContent())
                .task(task)
                .author(author)
                .build();

        commentRepository.save(comment);

        activityLogService.log("COMMENTED", "TASK", task.getId(), task.getTaskKey(),
                author.getFullName() + " commented on " + task.getTaskKey(), task.getProject().getId());

        if (task.getAssignee() != null && !task.getAssignee().getId().equals(author.getId())) {
            notificationService.sendNotification(task.getAssignee().getId(), "COMMENT_ADDED",
                    "New comment on " + task.getTaskKey(),
                    author.getFullName() + " commented: " + truncate(request.getContent(), 100),
                    "TASK", task.getId());
        }

        processMentions(request.getContent(), task, author);

        for (User watcher : task.getWatchers()) {
            if (!watcher.getId().equals(author.getId())
                    && (task.getAssignee() == null || !watcher.getId().equals(task.getAssignee().getId()))) {
                notificationService.sendNotification(watcher.getId(), "COMMENT_ADDED",
                        "New comment on " + task.getTaskKey(),
                        author.getFullName() + " commented: " + truncate(request.getContent(), 100),
                        "TASK", task.getId());
            }
        }

        return commentMapper.toResponse(comment);
    }

    @Transactional
    public CommentResponse updateComment(Long id, CommentRequest request) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));
        comment.setContent(request.getContent());
        commentRepository.save(comment);
        return commentMapper.toResponse(comment);
    }

    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));
        commentRepository.delete(comment);
    }

    private void processMentions(String content, Task task, User author) {
        Matcher matcher = MENTION_PATTERN.matcher(content);
        while (matcher.find()) {
            String email = matcher.group(1);
            userRepository.findByEmail(email).ifPresent(mentionedUser -> {
                if (!mentionedUser.getId().equals(author.getId())) {
                    notificationService.sendNotification(mentionedUser.getId(), "MENTIONED",
                            "You were mentioned in " + task.getTaskKey(),
                            author.getFullName() + " mentioned you: " + truncate(content, 100),
                            "TASK", task.getId());
                    task.getWatchers().add(mentionedUser);
                    taskRepository.save(task);
                }
            });
        }
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) + "..." : text;
    }
}
