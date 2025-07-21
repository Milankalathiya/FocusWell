package com.focuswell.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.focuswell.model.Habit;
import com.focuswell.model.HabitLog;
import com.focuswell.model.User;
import com.focuswell.repository.HabitLogRepository;
import com.focuswell.repository.HabitRepository;
import com.focuswell.repository.UserRepository;

@Service
public class HabitLogService {
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final UserRepository userRepository;

    public HabitLogService(HabitRepository habitRepository, HabitLogRepository habitLogRepository,
            UserRepository userRepository) {
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
        this.userRepository = userRepository;
    }

    public HabitLog logHabit(Long habitId, String username) {
        User user = (User) userRepository.findByUsername(username).orElseThrow();
        Habit habit = habitRepository.findById(habitId)
                .filter(h -> h.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Habit not found or not yours"));

        LocalDate today = LocalDate.now();
        boolean alreadyLogged = habitLogRepository.findByHabitAndLogDate(habit, today).size() > 0;
        if (alreadyLogged)
            throw new RuntimeException("Habit already logged today");

        HabitLog log = new HabitLog();
        log.setHabit(habit);
        log.setUser(user);
        log.setLogDate(today);
        return habitLogRepository.save(log);
    }

    public int getCurrentStreak(Habit habit) {
        int streak = 0;
        LocalDate today = LocalDate.now();

        while (true) {
            LocalDate checkDate = habit.getFrequency().equalsIgnoreCase("WEEKLY")
                    ? today.with(DayOfWeek.MONDAY).minusWeeks(streak)
                    : today.minusDays(streak);

            boolean logged = habitLogRepository.findByHabitAndLogDate(habit, checkDate).size() > 0;
            if (logged)
                streak++;
            else
                break;
        }
        return streak;
    }

    public Map<String, Long> getWeeklyProgress(Habit habit) {
        List<HabitLog> logs = habitLogRepository.findByHabitAndLogDateBetween(
                habit,
                LocalDate.now().minusDays(6),
                LocalDate.now());

        return logs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getLogDate().toString(), // YYYY-MM-DD
                        Collectors.counting()));
    }

    public List<HabitLog> getLogsForHabit(Habit habit) {
        return habitLogRepository.findByHabitAndLogDateBetween(
                habit,
                LocalDate.of(2000, 1, 1), // earliest reasonable date
                LocalDate.now());
    }
}
