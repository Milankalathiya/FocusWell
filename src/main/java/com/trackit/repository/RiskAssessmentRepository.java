package com.trackit.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trackit.model.RiskAssessment;
import com.trackit.model.User;

@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {

  // Find risk assessment by user and date
  Optional<RiskAssessment> findByUserAndAssessmentDate(User user, LocalDate assessmentDate);

  // Find all risk assessments for a user
  List<RiskAssessment> findByUserOrderByAssessmentDateDesc(User user);

  // Find risk assessments for a user within a date range
  List<RiskAssessment> findByUserAndAssessmentDateBetweenOrderByAssessmentDateDesc(
      User user, LocalDate startDate, LocalDate endDate);

  // Find high-risk assessments for a user
  @Query("SELECT r FROM RiskAssessment r WHERE r.user = :user AND r.overallRiskLevel IN ('HIGH', 'CRITICAL') ORDER BY r.assessmentDate DESC")
  List<RiskAssessment> findHighRiskAssessments(@Param("user") User user);

  // Find assessments that require immediate attention
  List<RiskAssessment> findByUserAndRequiresImmediateAttentionTrueOrderByAssessmentDateDesc(User user);

  // Find assessments that suggest contacting a professional
  List<RiskAssessment> findByUserAndShouldContactProfessionalTrueOrderByAssessmentDateDesc(User user);

  // Find the latest risk assessment for a user
  @Query("SELECT r FROM RiskAssessment r WHERE r.user = :user ORDER BY r.assessmentDate DESC LIMIT 1")
  Optional<RiskAssessment> findLatestAssessment(@Param("user") User user);

  // Find risk assessments in the last N days
  @Query("SELECT r FROM RiskAssessment r WHERE r.user = :user AND r.assessmentDate >= :startDate ORDER BY r.assessmentDate DESC")
  List<RiskAssessment> findByUserAndAssessmentDateAfterOrderByAssessmentDateDesc(
      @Param("user") User user, @Param("startDate") LocalDate startDate);

  // Count risk assessments for a user
  long countByUser(User user);

  // Count high-risk assessments for a user
  @Query("SELECT COUNT(r) FROM RiskAssessment r WHERE r.user = :user AND r.overallRiskLevel IN ('HIGH', 'CRITICAL')")
  long countHighRiskAssessments(@Param("user") User user);

  // Check if user has risk assessment for a specific date
  boolean existsByUserAndAssessmentDate(User user, LocalDate assessmentDate);
}
