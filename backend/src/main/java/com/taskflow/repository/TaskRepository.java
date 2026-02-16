package com.taskflow.repository;

import com.taskflow.entity.Task;
import com.taskflow.enums.TaskPriority;
import com.taskflow.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByProjectId(Long projectId, Pageable pageable);

    List<Task> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    Page<Task> findByAssigneeId(Long assigneeId, Pageable pageable);

    Optional<Task> findByTaskKey(String taskKey);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    List<Task> findByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    long countByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    long countByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status = :status AND (t.assignee.id = :userId OR t.reporter.id = :userId)")
    long countByUserAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId OR t.reporter.id = :userId")
    long countByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.priority = :priority AND (t.assignee.id = :userId OR t.reporter.id = :userId)")
    long countByUserAndPriority(@Param("userId") Long userId, @Param("priority") TaskPriority priority);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.dueDate < CURRENT_DATE AND t.status <> 'DONE' AND (t.assignee.id = :userId OR t.reporter.id = :userId)")
    long countOverdueByUser(@Param("userId") Long userId);

    @Query("SELECT t FROM Task t WHERE (t.assignee.id = :userId OR t.reporter.id = :userId) ORDER BY t.createdAt DESC")
    Page<Task> findRecentByUser(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE (LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.taskKey) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Task> searchTasks(@Param("query") String query, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:assigneeId IS NULL OR t.assignee.id = :assigneeId)")
    Page<Task> findByProjectWithFilters(@Param("projectId") Long projectId,
                                         @Param("status") TaskStatus status,
                                         @Param("priority") TaskPriority priority,
                                         @Param("assigneeId") Long assigneeId,
                                         Pageable pageable);

    List<Task> findBySprintId(Long sprintId);

    @Query("SELECT t FROM Task t JOIN t.watchers w WHERE w.id = :userId")
    Page<Task> findWatchedByUser(@Param("userId") Long userId, Pageable pageable);

    List<Task> findByIdIn(List<Long> ids);
}
