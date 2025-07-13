package com.trackit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trackit.model.Recommendation;
import com.trackit.model.User;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

  // Find all recommendations for a user
  List<Recommendation> findByUserOrderByCreatedAtDesc(User user);

  // Find active (non-completed) recommendations for a user
  List<Recommendation> findByUserAndIsCompletedFalseOrderByPriorityDescCreatedAtDesc(User user);

  // Find completed recommendations for a user
  List<Recommendation> findByUserAndIsCompletedTrueOrderByCompletedAtDesc(User user);

  // Find recommendations by type for a user
  List<Recommendation> findByUserAndRecommendationTypeOrderByCreatedAtDesc(
      User user, Recommendation.RecommendationType recommendationType);

  // Find high priority recommendations for a user
  @Query("SELECT r FROM Recommendation r WHERE r.user = :user AND r.priority IN ('HIGH', 'URGENT') ORDER BY r.priority DESC, r.createdAt DESC")
  List<Recommendation> findHighPriorityRecommendations(@Param("user") User user);

  // Find urgent recommendations for a user
  List<Recommendation> findByUserAndPriorityOrderByCreatedAtDesc(User user, Recommendation.Priority priority);

  // Find recommendations by category for a user
  List<Recommendation> findByUserAndCategoryOrderByCreatedAtDesc(User user, String category);

  // Find recommendations by difficulty level for a user
  List<Recommendation> findByUserAndDifficultyLevelOrderByCreatedAtDesc(
      User user, Recommendation.DifficultyLevel difficultyLevel);

  // Count active recommendations for a user
  long countByUserAndIsCompletedFalse(User user);

  // Count high priority recommendations for a user
  @Query("SELECT COUNT(r) FROM Recommendation r WHERE r.user = :user AND r.priority IN ('HIGH', 'URGENT') AND r.isCompleted = false")
  long countHighPriorityActiveRecommendations(@Param("user") User user);

  // Find recommendations created in the last N days
  @Query("SELECT r FROM Recommendation r WHERE r.user = :user AND r.createdAt >= :startDate ORDER BY r.createdAt DESC")
  List<Recommendation> findByUserAndCreatedAtAfterOrderByCreatedAtDesc(
      @Param("user") User user, @Param("startDate") java.time.LocalDateTime startDate);

  // Find recommendations by estimated time (quick wins)
  @Query("SELECT r FROM Recommendation r WHERE r.user = :user AND r.estimatedTimeMinutes <= :maxMinutes AND r.isCompleted = false ORDER BY r.estimatedTimeMinutes ASC")
  List<Recommendation> findQuickWins(@Param("user") User user, @Param("maxMinutes") Integer maxMinutes);
}
