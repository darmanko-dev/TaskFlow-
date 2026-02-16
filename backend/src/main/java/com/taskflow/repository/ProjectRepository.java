package com.taskflow.repository;

import com.taskflow.entity.Project;
import com.taskflow.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p WHERE p.deleted = false AND (p.owner.id = :userId OR :userId IN (SELECT m.id FROM p.members m))")
    Page<Project> findUserProjects(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.deleted = false AND p.status = :status AND (p.owner.id = :userId OR :userId IN (SELECT m.id FROM p.members m))")
    Page<Project> findUserProjectsByStatus(@Param("userId") Long userId, @Param("status") ProjectStatus status, Pageable pageable);

    Optional<Project> findByIdAndDeletedFalse(Long id);

    boolean existsByKey(String key);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.deleted = false AND (p.owner.id = :userId OR :userId IN (SELECT m.id FROM p.members m))")
    long countUserProjects(@Param("userId") Long userId);
}
