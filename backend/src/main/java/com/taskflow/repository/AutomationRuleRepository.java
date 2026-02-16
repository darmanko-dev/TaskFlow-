package com.taskflow.repository;

import com.taskflow.entity.AutomationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AutomationRuleRepository extends JpaRepository<AutomationRule, Long> {
    List<AutomationRule> findByProjectIdAndEnabledTrueOrderByCreatedAtDesc(Long projectId);
    List<AutomationRule> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<AutomationRule> findByTriggerTypeAndProjectIdAndEnabledTrue(String triggerType, Long projectId);
}
