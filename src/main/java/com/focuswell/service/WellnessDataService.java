package com.focuswell.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.focuswell.dto.WellnessDataRequest;
import com.focuswell.model.User;
import com.focuswell.model.WellnessData;
import com.focuswell.repository.WellnessDataRepository;

@Service
public class WellnessDataService {

  @Autowired
  private WellnessDataRepository wellnessDataRepository;

  @Autowired
  private UserService userService;

  // Save or update wellness data for a user
  public WellnessData saveWellnessData(Long userId, WellnessDataRequest request) {
    User user = userService.findById(userId);

    // Check if data already exists for this date
    Optional<WellnessData> existingData = wellnessDataRepository.findByUserAndDate(user, request.getDate());

    WellnessData wellnessData;
    if (existingData.isPresent()) {
      wellnessData = existingData.get();
    } else {
      wellnessData = new WellnessData();
      wellnessData.setUser(user);
      wellnessData.setDate(request.getDate());
    }

    // Update fields
    wellnessData.setSleepHours(request.getSleepHours());
    wellnessData.setSleepQuality(request.getSleepQuality());
    wellnessData.setMoodScore(request.getMoodScore());
    wellnessData.setStressLevel(request.getStressLevel());
    wellnessData.setProductivityScore(request.getProductivityScore());
    wellnessData.setPhysicalActivityMinutes(request.getPhysicalActivityMinutes());
    wellnessData.setSocialInteractionHours(request.getSocialInteractionHours());
    wellnessData.setScreenTimeHours(request.getScreenTimeHours());
    wellnessData.setWaterIntakeGlasses(request.getWaterIntakeGlasses());
    wellnessData.setMealsSkipped(request.getMealsSkipped());
    wellnessData.setMeditationMinutes(request.getMeditationMinutes());
    wellnessData.setEnergyLevel(request.getEnergyLevel());
    wellnessData.setNotes(request.getNotes());

    return wellnessDataRepository.save(wellnessData);
  }

  // Get wellness data for a specific date
  public Optional<WellnessData> getWellnessDataByDate(Long userId, LocalDate date) {
    User user = userService.findById(userId);
    return wellnessDataRepository.findByUserAndDate(user, date);
  }

  // Get all wellness data for a user
  public List<WellnessData> getAllWellnessData(Long userId) {
    User user = userService.findById(userId);
    return wellnessDataRepository.findByUserOrderByDateDesc(user);
  }

  // Get wellness data for a date range
  public List<WellnessData> getWellnessDataByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
    User user = userService.findById(userId);
    return wellnessDataRepository.findByUserAndDateBetweenOrderByDateDesc(user, startDate, endDate);
  }

  // Get wellness data for the last N days
  public List<WellnessData> getRecentWellnessData(Long userId, int days) {
    User user = userService.findById(userId);
    LocalDate startDate = LocalDate.now().minusDays(days);
    return wellnessDataRepository.findByUserAndDateAfterOrderByDateDesc(user, startDate);
  }

  // Get complete wellness data (with all required fields)
  public List<WellnessData> getCompleteWellnessData(Long userId) {
    User user = userService.findById(userId);
    return wellnessDataRepository.findCompleteWellnessDataByUser(user);
  }

  // Calculate average wellness score for a date range
  public Double calculateAverageWellnessScore(Long userId, LocalDate startDate, LocalDate endDate) {
    User user = userService.findById(userId);
    return wellnessDataRepository.calculateAverageWellnessScore(user, startDate, endDate);
  }

  // Find days with low wellness scores
  public List<WellnessData> findLowWellnessDays(Long userId, Double threshold) {
    User user = userService.findById(userId);
    return wellnessDataRepository.findLowWellnessDays(user, threshold);
  }

  // Get wellness statistics
  public WellnessStats getWellnessStats(Long userId) {
    try {
      User user = userService.findById(userId);
      if (user == null) {
        // Return empty stats if user not found
        return new WellnessStats();
      }

      WellnessStats stats = new WellnessStats();

      try {
        stats.setTotalEntries(wellnessDataRepository.countByUser(user));
      } catch (Exception e) {
        System.err.println("Error counting wellness entries: " + e.getMessage());
        stats.setTotalEntries(0L);
      }

      // Get all wellness data for the user
      List<WellnessData> allData = null;
      try {
        allData = wellnessDataRepository.findByUserOrderByDateDesc(user);
      } catch (Exception e) {
        System.err.println("Error fetching wellness data: " + e.getMessage());
        allData = new java.util.ArrayList<>();
      }

      if (allData != null && !allData.isEmpty()) {
        try {
          // Get the most recent wellness score
          WellnessData mostRecent = allData.get(0);
          if (mostRecent != null && mostRecent.getWellnessScore() != null) {
            stats.setCurrentWellnessScore(mostRecent.getWellnessScore());
          }
        } catch (Exception e) {
          System.err.println("Error getting most recent wellness score: " + e.getMessage());
        }

        try {
          // Calculate average wellness score from all data
          double totalScore = 0;
          int count = 0;
          for (WellnessData data : allData) {
            if (data != null && data.getWellnessScore() != null) {
              totalScore += data.getWellnessScore();
              count++;
            }
          }
          if (count > 0) {
            stats.setAverageWellnessScore(Math.round((totalScore / count) * 100.0) / 100.0);
          }
        } catch (Exception e) {
          System.err.println("Error calculating average wellness score: " + e.getMessage());
        }
      }

      try {
        // Get streak days
        stats.setStreakDays(calculateStreakDays(user));
      } catch (Exception e) {
        System.err.println("Error calculating streak days: " + e.getMessage());
        stats.setStreakDays(0);
      }

      return stats;
    } catch (Exception e) {
      // Log the error and return empty stats
      System.err.println("Error in getWellnessStats: " + e.getMessage());
      e.printStackTrace();
      WellnessStats emptyStats = new WellnessStats();
      emptyStats.setTotalEntries(0L);
      emptyStats.setCurrentWellnessScore(0.0);
      emptyStats.setAverageWellnessScore(0.0);
      emptyStats.setStreakDays(0);
      return emptyStats;
    }
  }

  // Calculate streak days (consecutive days with data)
  private int calculateStreakDays(User user) {
    try {
      List<WellnessData> allData = wellnessDataRepository.findByUserOrderByDateDesc(user);
      if (allData == null || allData.isEmpty())
        return 0;

      int streak = 0;
      LocalDate currentDate = LocalDate.now();

      for (WellnessData data : allData) {
        if (data != null && data.getDate() != null && data.getDate().equals(currentDate.minusDays(streak))) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (Exception e) {
      System.err.println("Error calculating streak days: " + e.getMessage());
      return 0;
    }
  }

  // Check if user has data for today
  public boolean hasTodayData(Long userId) {
    User user = userService.findById(userId);
    return wellnessDataRepository.existsByUserAndDate(user, LocalDate.now());
  }

  // Inner class for wellness statistics
  public static class WellnessStats {
    private Long totalEntries;
    private Double currentWellnessScore;
    private Double averageWellnessScore;
    private Integer streakDays;

    // Getters and setters
    public Long getTotalEntries() {
      return totalEntries;
    }

    public void setTotalEntries(Long totalEntries) {
      this.totalEntries = totalEntries;
    }

    public Double getCurrentWellnessScore() {
      return currentWellnessScore;
    }

    public void setCurrentWellnessScore(Double currentWellnessScore) {
      this.currentWellnessScore = currentWellnessScore;
    }

    public Double getAverageWellnessScore() {
      return averageWellnessScore;
    }

    public void setAverageWellnessScore(Double averageWellnessScore) {
      this.averageWellnessScore = averageWellnessScore;
    }

    public Integer getStreakDays() {
      return streakDays;
    }

    public void setStreakDays(Integer streakDays) {
      this.streakDays = streakDays;
    }
  }
}
