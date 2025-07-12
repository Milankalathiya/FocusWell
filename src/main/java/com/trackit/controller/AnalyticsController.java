package com.trackit.controller;

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

import com.trackit.model.HabitLog;
import com.trackit.model.Task;
import com.trackit.model.User;
import com.trackit.repository.HabitLogRepository;
import com.trackit.repository.TaskRepository;
import com.trackit.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final HabitLogRepository habitLogRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public Map<String, Object> getSummary(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30); // Last 30 days

        // Get task statistics
        List<Task> tasks = taskRepository.findByUserAndCreatedAtBetween(user, startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59));
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(Task::isCompleted).count();
        long pendingTasks = totalTasks - completedTasks;

        // Get habit statistics
        List<HabitLog> habitLogs = habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate);
        long totalHabitLogs = habitLogs.size();

        Map<String, Object> result = new HashMap<>();
        result.put("totalTasks", totalTasks);
        result.put("completedTasks", completedTasks);
        result.put("pendingTasks", pendingTasks);
        result.put("totalHabitLogs", totalHabitLogs);
        result.put("period", "Last 30 days");

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
