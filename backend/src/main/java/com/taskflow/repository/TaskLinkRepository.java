package com.taskflow.repository;

import com.taskflow.entity.TaskLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskLinkRepository extends JpaRepository<TaskLink, Long> {
    @Query("SELECT tl FROM TaskLink tl WHERE tl.sourceTask.id = :taskId OR tl.targetTask.id = :taskId")
    List<TaskLink> findByTaskId(@Param("taskId") Long taskId);
    
    List<TaskLink> findBySourceTaskId(Long sourceTaskId);
    List<TaskLink> findByTargetTaskId(Long targetTaskId);
}
