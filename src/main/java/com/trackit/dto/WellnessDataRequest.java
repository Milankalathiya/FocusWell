package com.trackit.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WellnessDataRequest {

  @NotNull(message = "Date is required")
  private LocalDate date;

  // Sleep metrics
  @Min(value = 0, message = "Sleep hours cannot be negative")
  @Max(value = 24, message = "Sleep hours cannot exceed 24")
  private Double sleepHours;

  @Min(value = 1, message = "Sleep quality must be between 1 and 10")
  @Max(value = 10, message = "Sleep quality must be between 1 and 10")
  private Integer sleepQuality;

  // Mood and stress
  @Min(value = 1, message = "Mood score must be between 1 and 10")
  @Max(value = 10, message = "Mood score must be between 1 and 10")
  private Integer moodScore;

  @Min(value = 1, message = "Stress level must be between 1 and 10")
  @Max(value = 10, message = "Stress level must be between 1 and 10")
  private Integer stressLevel;

  // Productivity
  @Min(value = 1, message = "Productivity score must be between 1 and 10")
  @Max(value = 10, message = "Productivity score must be between 1 and 10")
  private Integer productivityScore;

  // Physical activity
  @Min(value = 0, message = "Physical activity cannot be negative")
  @Max(value = 1440, message = "Physical activity cannot exceed 24 hours")
  private Integer physicalActivityMinutes;

  // Social interaction
  @Min(value = 0, message = "Social interaction hours cannot be negative")
  @Max(value = 24, message = "Social interaction hours cannot exceed 24")
  private Double socialInteractionHours;

  // Digital wellness
  @Min(value = 0, message = "Screen time cannot be negative")
  @Max(value = 24, message = "Screen time cannot exceed 24 hours")
  private Double screenTimeHours;

  // Nutrition
  @Min(value = 0, message = "Water intake cannot be negative")
  @Max(value = 50, message = "Water intake cannot exceed 50 glasses")
  private Integer waterIntakeGlasses;

  @Min(value = 0, message = "Meals skipped cannot be negative")
  @Max(value = 5, message = "Meals skipped cannot exceed 5")
  private Integer mealsSkipped;

  // Additional wellness metrics
  @Min(value = 0, message = "Meditation minutes cannot be negative")
  @Max(value = 1440, message = "Meditation minutes cannot exceed 24 hours")
  private Integer meditationMinutes;

  @Min(value = 1, message = "Energy level must be between 1 and 10")
  @Max(value = 10, message = "Energy level must be between 1 and 10")
  private Integer energyLevel;

  // Notes
  private String notes;
}
