package com.taskflow.controller;

import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.AttachmentResponse;
import com.taskflow.entity.Attachment;
import com.taskflow.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
@Tag(name = "Attachments", description = "File attachment endpoints")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping("/task/{taskId}")
    @Operation(summary = "Get task attachments")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getTaskAttachments(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success(attachmentService.getTaskAttachments(taskId)));
    }

    @PostMapping("/task/{taskId}")
    @Operation(summary = "Upload attachment to task")
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File uploaded", attachmentService.uploadAttachment(taskId, file)));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download attachment")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long id) throws MalformedURLException {
        Path filePath = attachmentService.getAttachmentPath(id);
        Attachment attachment = attachmentService.getAttachmentEntity(id);

        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete attachment")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.ok(ApiResponse.success("File deleted", null));
    }
}
