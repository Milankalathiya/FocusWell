package com.focuswell.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.focuswell.model.User;
import com.focuswell.model.WeightLog;

public interface WeightLogRepository extends JpaRepository<WeightLog, Long> {
  List<WeightLog> findByUserAndDateBetweenOrderByDateAsc(User user, LocalDate start, LocalDate end);
}
