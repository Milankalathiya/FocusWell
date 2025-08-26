package com.focuswell.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.focuswell.model.MealPlan;
import com.focuswell.model.User;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
  Optional<MealPlan> findByUserAndDate(User user, LocalDate date);
  List<MealPlan> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);
}
