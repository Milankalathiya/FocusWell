package com.focuswell.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.focuswell.model.MealLog;
import com.focuswell.model.User;

public interface MealLogRepository extends JpaRepository<MealLog, Long> {
  List<MealLog> findByUserAndDate(User user, LocalDate date);

  List<MealLog> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);
}
