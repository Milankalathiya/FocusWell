package com.focuswell.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.focuswell.model.HabitLog;
import com.focuswell.model.Task;
import com.focuswell.model.User;
import com.focuswell.repository.HabitLogRepository;
import com.focuswell.repository.TaskRepository;
import com.focuswell.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final HabitLogRepository habitLogRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public Map<String, Object> getSummary(
            Principal principal,
            @RequestParam(defaultValue = "30") int days) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1); // inclusive

        // Get task statistics (use dueDate instead of createdAt)
        List<Task> tasks = taskRepository.findByUserAndDueDateBetween(user, startDate, endDate);
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(Task::isCompleted).count();

        // Get habit statistics
        List<HabitLog> habitLogs = habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate);
        long totalHabitLogs = habitLogs.size();
        long activeHabits = habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate)
                .stream().map(log -> log.getHabit().getId()).distinct().count();

        // Consistency score: days with at least one habit log / total days
        Map<LocalDate, Long> logsByDay = new java.util.HashMap<>();
        for (HabitLog log : habitLogs) {
            logsByDay.put(log.getLogDate(), logsByDay.getOrDefault(log.getLogDate(), 0L) + 1);
        }
        long daysWithHabits = logsByDay.size();
        double consistencyScore = days > 0 ? (double) daysWithHabits / days : 0.0;

        // Best and worst day (by number of habit logs)
        String bestDay = null;
        String worstDay = null;
        long max = 0;
        long min = Long.MAX_VALUE;
        for (Map.Entry<LocalDate, Long> entry : logsByDay.entrySet()) {
            long count = entry.getValue();
            if (count > max) {
                max = count;
                bestDay = entry.getKey().toString();
            }
            if (count < min) {
                min = count;
                worstDay = entry.getKey().toString();
            }
        }
        if (min == Long.MAX_VALUE)
            min = 0;

        // Tasks this period (array of completed tasks per day)
        List<Integer> tasksThisWeek = new java.util.ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = endDate.minusDays(i);
            long count = tasks.stream().filter(
                    t -> t.isCompleted() && t.getCompletedAt() != null && t.getCompletedAt().toLocalDate().equals(d))
                    .count();
            tasksThisWeek.add((int) count);
        }
        // Habits this period (array of habit logs per day)
        List<Integer> habitsThisWeek = new java.util.ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = endDate.minusDays(i);
            long count = habitLogs.stream().filter(log -> log.getLogDate().equals(d)).count();
            habitsThisWeek.add((int) count);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalTasks", totalTasks);
        result.put("completedTasks", completedTasks);
        result.put("activeHabits", activeHabits);
        result.put("consistencyScore", consistencyScore);
        result.put("bestDay", bestDay);
        result.put("worstDay", worstDay);
        result.put("tasksThisWeek", tasksThisWeek);
        result.put("habitsThisWeek", habitsThisWeek);
        result.put("period", "Last " + days + " days");
        return result;
    }

    @GetMapping("/task-completion")
    public Map<String, Object> getTaskCompletion(
            Principal principal,
            @RequestParam(defaultValue = "7") int days) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        List<Task> tasks = taskRepository.findByUserAndCreatedAtBetween(user, startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59));

        Map<String, Long> completionByDay = new HashMap<>();
        for (Task task : tasks) {
            if (task.isCompleted() && task.getCompletedAt() != null) {
                LocalDate completionDate = task.getCompletedAt().toLocalDate();
                completionByDay.put(completionDate.toString(),
                        completionByDay.getOrDefault(completionDate.toString(), 0L) + 1);
            }
        }

        return Map.of(
                "completionByDay", completionByDay,
                "totalTasks", tasks.size(),
                "completedTasks", tasks.stream().filter(Task::isCompleted).count(),
                "period", days + " days");
    }

    @GetMapping("/habit-consistency")
    public Map<String, Object> getHabitConsistency(
            Principal principal,
            @RequestParam(defaultValue = "7") int days) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        List<HabitLog> logs = habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate);

        Map<String, Long> consistencyByDay = new HashMap<>();
        for (HabitLog log : logs) {
            String dateStr = log.getLogDate().toString();
            consistencyByDay.put(dateStr, consistencyByDay.getOrDefault(dateStr, 0L) + 1);
        }

        long totalDays = days;
        long daysWithHabits = consistencyByDay.size();
        double consistencyRate = totalDays > 0 ? (double) daysWithHabits / totalDays : 0.0;

        return Map.of(
                "consistencyByDay", consistencyByDay,
                "totalDays", totalDays,
                "daysWithHabits", daysWithHabits,
                "consistencyRate", String.format("%.2f", consistencyRate),
                "period", days + " days");
    }

    @GetMapping("/consistency")
    public Map<String, Object> getConsistency(
            Principal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        List<HabitLog> logs = habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate);

        // Use a Set to track distinct days
        Set<LocalDate> loggedDays = new HashSet<>();
        for (HabitLog log : logs) {
            loggedDays.add(log.getLogDate());
        }

        long totalDays = startDate.until(endDate).getDays() + 1;
        double consistency = (double) loggedDays.size() / totalDays;

        return Map.of(
                "daysWithHabits", loggedDays.size(),
                "totalDays", totalDays,
                "consistency", String.format("%.2f", consistency));
    }

    @GetMapping("/best-worst-days")
    public Map<String, Object> getBestAndWorstDays(
            Principal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        List<HabitLog> logs = habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate);

        Map<LocalDate, Long> countByDate = new HashMap<>();
        for (HabitLog log : logs) {
            countByDate.put(log.getLogDate(), countByDate.getOrDefault(log.getLogDate(), 0L) + 1);
        }

        String bestDay = null;
        String worstDay = null;
        long max = 0;
        long min = Long.MAX_VALUE;

        for (Map.Entry<LocalDate, Long> entry : countByDate.entrySet()) {
            long count = entry.getValue();
            if (count > max) {
                max = count;
                bestDay = entry.getKey().toString();
            }
            if (count < min) {
                min = count;
                worstDay = entry.getKey().toString();
            }
        }

        return Map.of(
                "bestDay", bestDay != null ? bestDay : "No data",
                "bestDayLogs", max,
                "worstDay", worstDay != null ? worstDay : "No data",
                "worstDayLogs", min == Long.MAX_VALUE ? 0 : min);
    }
}
