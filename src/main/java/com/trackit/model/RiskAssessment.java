package com.trackit.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "risk_assessments", indexes = {
    @Index(name = "idx_user_date", columnList = "user_id, assessment_date"),
    @Index(name = "idx_risk_level", columnList = "overall_risk_level")
})
public class RiskAssessment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Assessment date is required")
  @Column(name = "assessment_date", nullable = false)
  private LocalDate assessmentDate;

  // Risk scores (0.0 to 1.0, where 1.0 is highest risk)
  @Column(name = "depression_risk")
  private Double depressionRisk;

  @Column(name = "anxiety_risk")
  private Double anxietyRisk;

  @Column(name = "burnout_risk")
  private Double burnoutRisk;

  @Column(name = "stress_risk")
  private Double stressRisk;

  @Column(name = "isolation_risk")
  private Double isolationRisk;

  // Overall risk level
  @Enumerated(EnumType.STRING)
  @Column(name = "overall_risk_level", nullable = false)
  private RiskLevel overallRiskLevel;

  // Risk factors identified
  @Column(name = "risk_factors", columnDefinition = "TEXT")
  private String riskFactors;

  // Recommendations
  @Column(name = "recommendations", columnDefinition = "TEXT")
  private String recommendations;

  // Alert flags
  @Column(name = "requires_immediate_attention")
  private Boolean requiresImmediateAttention = false;

  @Column(name = "should_contact_professional")
  private Boolean shouldContactProfessional = false;

  // User relationship
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // Risk level enum
  public enum RiskLevel {
    LOW("Low Risk"),
    MODERATE("Moderate Risk"),
    HIGH("High Risk"),
    CRITICAL("Critical Risk");

    private final String displayName;

    RiskLevel(String displayName) {
      this.displayName = displayName;
    }

    public String getDisplayName() {
      return displayName;
    }
  }

  // Helper methods
  public Double getAverageRisk() {
    int count = 0;
    double total = 0.0;

    if (depressionRisk != null) {
      total += depressionRisk;
      count++;
    }
    if (anxietyRisk != null) {
      total += anxietyRisk;
      count++;
    }
    if (burnoutRisk != null) {
      total += burnoutRisk;
      count++;
    }
    if (stressRisk != null) {
      total += stressRisk;
      count++;
    }
    if (isolationRisk != null) {
      total += isolationRisk;
      count++;
    }

    return count > 0 ? total / count : null;
  }

  public boolean isHighRisk() {
    return overallRiskLevel == RiskLevel.HIGH || overallRiskLevel == RiskLevel.CRITICAL;
  }

  public boolean needsProfessionalHelp() {
    return shouldContactProfessional != null && shouldContactProfessional;
  }
}
