package com.focuswell.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.focuswell.model.Priority;
import com.focuswell.model.Task;
import com.focuswell.model.User;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByUserOrderByDueDateAsc(User user);

    List<Task> findByUserAndDueDate(User user, LocalDate dueDate);

    List<Task> findByUserAndDueDateBetween(User user, LocalDate startDate, LocalDate endDate);

    List<Task> findByUserAndCompletedFalseAndDueDateBefore(User user, LocalDate date);

    List<Task> findByUserAndCategory(User user, String category);

    List<Task> findByUserAndPriority(User user, Priority priority);

    List<Task> findByUserAndArchivedFalse(User user);

    List<Task> findByUserAndCompletedTrue(User user);

    List<Task> findByUserAndCompletedFalse(User user);

    Optional<Task> findByIdAndUser(Long id, User user);

    List<Task> findByUserAndCreatedAtBetween(User user, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT DISTINCT t.category FROM Task t WHERE t.user = :user AND t.category IS NOT NULL")
    List<String> findDistinctCategoriesByUser(@Param("user") User user);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user AND t.completed = true")
    Long countCompletedTasksByUser(@Param("user") User user);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user AND t.completed = false AND t.dueDate < :today")
    Long countOverdueTasksByUser(@Param("user") User user, @Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user AND t.dueDate = :today")
    Long countTodayTasksByUser(@Param("user") User user, @Param("today") LocalDate today);

    @Query("SELECT t.priority, COUNT(t) FROM Task t WHERE t.user = :user GROUP BY t.priority")
    List<Object[]> countTasksByPriority(@Param("user") User user);

    @Query("SELECT t.category, COUNT(t) FROM Task t WHERE t.user = :user AND t.category IS NOT NULL GROUP BY t.category")
    List<Object[]> countTasksByCategory(@Param("user") User user);

    @Query("SELECT t FROM Task t WHERE t.user = :user AND t.dueDate BETWEEN :startDate AND :endDate ORDER BY t.dueDate ASC")
    List<Task> findTasksInDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Task t WHERE t.user = :user AND t.completed = false AND t.dueDate <= :date ORDER BY t.dueDate ASC")
    List<Task> findPendingTasksByDate(@Param("user") User user, @Param("date") LocalDate date);
}
