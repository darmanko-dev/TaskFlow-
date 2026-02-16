package com.taskflow.entity;

import com.taskflow.enums.LinkType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_task_id", nullable = false)
    private Task sourceTask;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_task_id", nullable = false)
    private Task targetTask;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LinkType linkType;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
