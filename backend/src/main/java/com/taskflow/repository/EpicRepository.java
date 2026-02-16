package com.taskflow.repository;

import com.taskflow.entity.Epic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpicRepository extends JpaRepository<Epic, Long> {

    List<Epic> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.epic.id = :epicId")
    long countTasksByEpic(@Param("epicId") Long epicId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.epic.id = :epicId AND t.status = 'DONE'")
    long countCompletedTasksByEpic(@Param("epicId") Long epicId);
}
