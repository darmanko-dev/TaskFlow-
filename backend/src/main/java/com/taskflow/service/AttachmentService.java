package com.taskflow.service;

import com.taskflow.dto.response.AttachmentResponse;
import com.taskflow.entity.Attachment;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.exception.BadRequestException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.mapper.UserMapper;
import com.taskflow.repository.AttachmentRepository;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserService userService;
    private final UserMapper userMapper;
    private final ActivityLogService activityLogService;

    @Value("${taskflow.upload.dir:./uploads}")
    private String uploadDir;

    public List<AttachmentResponse> getTaskAttachments(Long taskId) {
        return attachmentRepository.findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AttachmentResponse uploadAttachment(Long taskId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User currentUser = userService.getCurrentUserEntity();

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir, "tasks", taskId.toString());

        try {
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            Attachment attachment = Attachment.builder()
                    .task(task)
                    .uploader(currentUser)
                    .fileName(fileName)
                    .originalFileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .filePath(filePath.toString())
                    .build();

            attachmentRepository.save(attachment);

            activityLogService.log("ATTACHED_FILE", "TASK", taskId, task.getTaskKey(),
                    "Attached file: " + file.getOriginalFilename(), task.getProject().getId());

            return toResponse(attachment);
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", "id", attachmentId));

        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't fail
        }

        activityLogService.log("REMOVED_FILE", "TASK", attachment.getTask().getId(),
                attachment.getTask().getTaskKey(),
                "Removed file: " + attachment.getOriginalFileName(),
                attachment.getTask().getProject().getId());

        attachmentRepository.delete(attachment);
    }

    public Path getAttachmentPath(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", "id", attachmentId));
        return Paths.get(attachment.getFilePath());
    }

    public Attachment getAttachmentEntity(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", "id", attachmentId));
    }

    private AttachmentResponse toResponse(Attachment attachment) {
        return AttachmentResponse.builder()
                .id(attachment.getId())
                .taskId(attachment.getTask().getId())
                .uploader(userMapper.toResponse(attachment.getUploader()))
                .fileName(attachment.getFileName())
                .originalFileName(attachment.getOriginalFileName())
                .fileType(attachment.getFileType())
                .fileSize(attachment.getFileSize())
                .downloadUrl("/api/attachments/" + attachment.getId() + "/download")
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}
