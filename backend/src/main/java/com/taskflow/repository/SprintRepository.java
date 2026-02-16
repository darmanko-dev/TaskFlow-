package com.taskflow.repository;

import com.taskflow.entity.Sprint;
import com.taskflow.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<Sprint> findByProjectIdAndStatusOrderByCreatedAtDesc(Long projectId, SprintStatus status);

    Optional<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.sprint.id = :sprintId")
    long countTasksBySprint(@Param("sprintId") Long sprintId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.sprint.id = :sprintId AND t.status = 'DONE'")
    long countCompletedTasksBySprint(@Param("sprintId") Long sprintId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.sprint.id = :sprintId AND t.status = 'TODO'")
    long countTodoTasksBySprint(@Param("sprintId") Long sprintId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.sprint.id = :sprintId AND t.status = 'IN_PROGRESS'")
    long countInProgressTasksBySprint(@Param("sprintId") Long sprintId);
}
