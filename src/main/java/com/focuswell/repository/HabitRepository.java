package com.focuswell.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.focuswell.model.Habit;
import com.focuswell.model.User;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUser(User user);

    Optional<Habit> findById(Long id);
}
