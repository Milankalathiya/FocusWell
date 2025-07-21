package com.focuswell.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class AnalyticsResponse {

  // Overall wellness metrics
  private Double currentWellnessScore;
  private Double averageWellnessScore;
  private Double wellnessScoreTrend; // positive or negative change
  private String wellnessLevel; // "Excellent", "Good", "Fair", "Poor"

  // Risk assessment
  private String overallRiskLevel;
  private Double depressionRisk;
  private Double anxietyRisk;
  private Double burnoutRisk;
  private Boolean requiresImmediateAttention;
  private Boolean shouldContactProfessional;

  // Trends and patterns
  private List<DailyWellnessData> recentData;
  private Map<String, Double> categoryAverages;
  private List<String> riskFactors;
  private List<String> positiveTrends;

  // Recommendations
  private Integer activeRecommendations;
  private Integer highPriorityRecommendations;
  private List<RecommendationSummary> topRecommendations;

  // Progress tracking
  private Integer daysTracked;
  private Integer streakDays;
  private LocalDate lastEntryDate;
  private Boolean hasRecentData;

  // Insights
  private String primaryInsight;
  private String improvementArea;
  private String strengthArea;

  @Data
  public static class DailyWellnessData {
    private LocalDate date;
    private Double wellnessScore;
    private Integer moodScore;
    private Integer stressLevel;
    private Integer productivityScore;
    private Integer sleepQuality;
    private Integer energyLevel;
    private String notes;
  }

  @Data
  public static class RecommendationSummary {
    private Long id;
    private String title;
    private String description;
    private String priority;
    private String difficultyLevel;
    private Integer estimatedTimeMinutes;
    private String category;
  }
}
