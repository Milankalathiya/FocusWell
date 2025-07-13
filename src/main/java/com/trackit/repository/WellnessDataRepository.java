package com.trackit.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trackit.model.User;
import com.trackit.model.WellnessData;

@Repository
public interface WellnessDataRepository extends JpaRepository<WellnessData, Long> {

  // Find wellness data by user and date
  Optional<WellnessData> findByUserAndDate(User user, LocalDate date);

  // Find all wellness data for a user
  List<WellnessData> findByUserOrderByDateDesc(User user);

  // Find wellness data for a user within a date range
  List<WellnessData> findByUserAndDateBetweenOrderByDateDesc(
      User user, LocalDate startDate, LocalDate endDate);

  // Find wellness data for a user in the last N days
  @Query("SELECT w FROM WellnessData w WHERE w.user = :user AND w.date >= :startDate ORDER BY w.date DESC")
  List<WellnessData> findByUserAndDateAfterOrderByDateDesc(
      @Param("user") User user, @Param("startDate") LocalDate startDate);

  // Find wellness data with complete scores (all required fields filled)
  @Query("SELECT w FROM WellnessData w WHERE w.user = :user AND w.moodScore IS NOT NULL " +
      "AND w.stressLevel IS NOT NULL AND w.productivityScore IS NOT NULL " +
      "AND w.sleepQuality IS NOT NULL AND w.energyLevel IS NOT NULL " +
      "ORDER BY w.date DESC")
  List<WellnessData> findCompleteWellnessDataByUser(@Param("user") User user);

  // Calculate average wellness score for a user in a date range
  @Query("SELECT AVG(w.moodScore * 0.25 + (11 - w.stressLevel) * 0.20 + " +
      "w.productivityScore * 0.20 + w.sleepQuality * 0.20 + w.energyLevel * 0.15) " +
      "FROM WellnessData w WHERE w.user = :user AND w.date BETWEEN :startDate AND :endDate " +
      "AND w.moodScore IS NOT NULL AND w.stressLevel IS NOT NULL " +
      "AND w.productivityScore IS NOT NULL AND w.sleepQuality IS NOT NULL " +
      "AND w.energyLevel IS NOT NULL")
  Double calculateAverageWellnessScore(@Param("user") User user,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  // Find days with low wellness scores (below threshold)
  @Query("SELECT w FROM WellnessData w WHERE w.user = :user " +
      "AND w.moodScore * 0.25 + (11 - w.stressLevel) * 0.20 + " +
      "w.productivityScore * 0.20 + w.sleepQuality * 0.20 + w.energyLevel * 0.15 < :threshold " +
      "AND w.moodScore IS NOT NULL AND w.stressLevel IS NOT NULL " +
      "AND w.productivityScore IS NOT NULL AND w.sleepQuality IS NOT NULL " +
      "AND w.energyLevel IS NOT NULL ORDER BY w.date DESC")
  List<WellnessData> findLowWellnessDays(@Param("user") User user, @Param("threshold") Double threshold);

  // Count wellness entries for a user
  long countByUser(User user);

  // Check if user has wellness data for a specific date
  boolean existsByUserAndDate(User user, LocalDate date);
}
