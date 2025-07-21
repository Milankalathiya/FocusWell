package com.focuswell.model;

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
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "recommendations", indexes = {
    @Index(name = "idx_user_priority", columnList = "user_id, priority"),
    @Index(name = "idx_recommendation_type", columnList = "recommendation_type")
})
public class Recommendation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "Title is required")
  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(name = "recommendation_type", nullable = false)
  private RecommendationType recommendationType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Priority priority = Priority.MEDIUM;

  @Column(name = "is_completed")
  private Boolean isCompleted = false;

  @Column(name = "completed_at")
  private LocalDateTime completedAt;

  @Column(name = "action_items", columnDefinition = "TEXT")
  private String actionItems;

  @Column(name = "expected_impact")
  private String expectedImpact;

  @Column(name = "difficulty_level")
  @Enumerated(EnumType.STRING)
  private DifficultyLevel difficultyLevel = DifficultyLevel.MEDIUM;

  @Column(name = "estimated_time_minutes")
  private Integer estimatedTimeMinutes;

  @Column(name = "category")
  private String category;

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

  // Enums
  public enum RecommendationType {
    SLEEP_IMPROVEMENT("Sleep Improvement"),
    STRESS_MANAGEMENT("Stress Management"),
    MOOD_ENHANCEMENT("Mood Enhancement"),
    PRODUCTIVITY_BOOST("Productivity Boost"),
    PHYSICAL_ACTIVITY("Physical Activity"),
    SOCIAL_CONNECTION("Social Connection"),
    DIGITAL_WELLNESS("Digital Wellness"),
    NUTRITION("Nutrition"),
    MINDFULNESS("Mindfulness"),
    WORK_LIFE_BALANCE("Work-Life Balance");

    private final String displayName;

    RecommendationType(String displayName) {
      this.displayName = displayName;
    }

    public String getDisplayName() {
      return displayName;
    }
  }

  public enum Priority {
    LOW("Low Priority"),
    MEDIUM("Medium Priority"),
    HIGH("High Priority"),
    URGENT("Urgent");

    private final String displayName;

    Priority(String displayName) {
      this.displayName = displayName;
    }

    public String getDisplayName() {
      return displayName;
    }
  }

  public enum DifficultyLevel {
    EASY("Easy"),
    MEDIUM("Medium"),
    HARD("Hard");

    private final String displayName;

    DifficultyLevel(String displayName) {
      this.displayName = displayName;
    }

    public String getDisplayName() {
      return displayName;
    }
  }

  // Helper methods
  public void markAsCompleted() {
    this.isCompleted = true;
    this.completedAt = LocalDateTime.now();
  }

  public boolean isUrgent() {
    return priority == Priority.URGENT;
  }

  public boolean isHighPriority() {
    return priority == Priority.HIGH || priority == Priority.URGENT;
  }
}
