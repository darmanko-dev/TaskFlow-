package com.taskflow.repository;

import com.taskflow.entity.SavedFilter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedFilterRepository extends JpaRepository<SavedFilter, Long> {
    List<SavedFilter> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT sf FROM SavedFilter sf WHERE sf.user.id = :userId AND sf.project.id = :projectId")
    List<SavedFilter> findByUserIdAndProjectId(@Param("userId") Long userId, @Param("projectId") Long projectId);
    
    @Query("SELECT sf FROM SavedFilter sf WHERE (sf.user.id = :userId OR sf.shared = true) AND sf.project.id = :projectId")
    List<SavedFilter> findAccessibleFilters(@Param("userId") Long userId, @Param("projectId") Long projectId);
}
