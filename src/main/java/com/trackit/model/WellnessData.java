package com.trackit.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "wellness_data", indexes = {
    @Index(name = "idx_user_date", columnList = "user_id, date"),
    @Index(name = "idx_date", columnList = "date")
})
public class WellnessData {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Date is required")
  @Column(nullable = false)
  private LocalDate date;

  // Sleep metrics
  @Column(name = "sleep_hours")
  @Min(value = 0, message = "Sleep hours cannot be negative")
  @Max(value = 24, message = "Sleep hours cannot exceed 24")
  private Double sleepHours;

  @Column(name = "sleep_quality")
  @Min(value = 1, message = "Sleep quality must be between 1 and 10")
  @Max(value = 10, message = "Sleep quality must be between 1 and 10")
  private Integer sleepQuality;

  // Mood and stress
  @Column(name = "mood_score")
  @Min(value = 1, message = "Mood score must be between 1 and 10")
  @Max(value = 10, message = "Mood score must be between 1 and 10")
  private Integer moodScore;

  @Column(name = "stress_level")
  @Min(value = 1, message = "Stress level must be between 1 and 10")
  @Max(value = 10, message = "Stress level must be between 1 and 10")
  private Integer stressLevel;

  // Productivity
  @Column(name = "productivity_score")
  @Min(value = 1, message = "Productivity score must be between 1 and 10")
  @Max(value = 10, message = "Productivity score must be between 1 and 10")
  private Integer productivityScore;

  // Physical activity
  @Column(name = "physical_activity_minutes")
  @Min(value = 0, message = "Physical activity cannot be negative")
  @Max(value = 1440, message = "Physical activity cannot exceed 24 hours")
  private Integer physicalActivityMinutes;

  // Social interaction
  @Column(name = "social_interaction_hours")
  @Min(value = 0, message = "Social interaction hours cannot be negative")
  @Max(value = 24, message = "Social interaction hours cannot exceed 24")
  private Double socialInteractionHours;

  // Digital wellness
  @Column(name = "screen_time_hours")
  @Min(value = 0, message = "Screen time cannot be negative")
  @Max(value = 24, message = "Screen time cannot exceed 24 hours")
  private Double screenTimeHours;

  // Nutrition
  @Column(name = "water_intake_glasses")
  @Min(value = 0, message = "Water intake cannot be negative")
  @Max(value = 50, message = "Water intake cannot exceed 50 glasses")
  private Integer waterIntakeGlasses;

  @Column(name = "meals_skipped")
  @Min(value = 0, message = "Meals skipped cannot be negative")
  @Max(value = 5, message = "Meals skipped cannot exceed 5")
  private Integer mealsSkipped;

  // Additional wellness metrics
  @Column(name = "meditation_minutes")
  @Min(value = 0, message = "Meditation minutes cannot be negative")
  @Max(value = 1440, message = "Meditation minutes cannot exceed 24 hours")
  private Integer meditationMinutes;

  @Column(name = "energy_level")
  @Min(value = 1, message = "Energy level must be between 1 and 10")
  @Max(value = 10, message = "Energy level must be between 1 and 10")
  private Integer energyLevel;

  // Notes
  @Column(columnDefinition = "TEXT")
  private String notes;

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

  // Helper methods
  public Double getWellnessScore() {
    if (moodScore == null || stressLevel == null || productivityScore == null ||
        sleepQuality == null || energyLevel == null) {
      return null;
    }

    // Calculate weighted wellness score
    double score = 0;
    score += moodScore * 0.25; // 25% weight
    score += (11 - stressLevel) * 0.20; // 20% weight (inverted stress)
    score += productivityScore * 0.20; // 20% weight
    score += sleepQuality * 0.20; // 20% weight
    score += energyLevel * 0.15; // 15% weight

    return Math.round(score * 100.0) / 100.0;
  }

  public boolean isComplete() {
    return moodScore != null && stressLevel != null && productivityScore != null &&
        sleepQuality != null && energyLevel != null;
  }
}
