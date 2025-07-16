package com.trackit.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trackit.model.Habit;
import com.trackit.model.HabitLog;
import com.trackit.model.User;

public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {
    List<HabitLog> findByHabitAndLogDate(Habit habit, LocalDate date);

    List<HabitLog> findByHabitAndLogDateBetween(Habit habit, LocalDate start, LocalDate end);

    List<HabitLog> findByUserAndLogDateBetween(User user, LocalDate start, LocalDate end);

    // Add this method to fetch all logs for a user
    List<HabitLog> findByUser(User user);
}
