package com.focuswell.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.focuswell.dto.TaskRequest;
import com.focuswell.exception.ResourceNotFoundException;
import com.focuswell.model.Priority;
import com.focuswell.model.Task;
import com.focuswell.model.User;
import com.focuswell.repository.TaskRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    public Task createTask(TaskRequest request, User user) {
        log.info("Creating task for user: {}", user.getUsername());

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority());
        task.setRepeatType(request.getRepeatType());
        task.setCategory(request.getCategory());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setActualHours(request.getActualHours());
        task.setUser(user);

        Task savedTask = taskRepository.save(task);
        log.info("Task created with ID: {}", savedTask.getId());
        return savedTask;
    }

    public List<Task> getAllTasks(User user) {
        log.info("Fetching all tasks for user: {}", user.getUsername());
        return taskRepository.findAllByUserOrderByDueDateAsc(user);
    }

    public List<Task> getTodayTasks(User user) {
        log.info("Fetching today's tasks for user: {}", user.getUsername());
        LocalDate today = LocalDate.now();
        return taskRepository.findByUserAndDueDate(user, today);
    }

    public List<Task> getOverdueTasks(User user) {
        log.info("Fetching overdue tasks for user: {}", user.getUsername());
        return taskRepository.findByUserAndCompletedFalseAndDueDateBefore(user, LocalDate.now());
    }

    public List<Task> getUpcomingTasks(User user, int days) {
        log.info("Fetching upcoming tasks for user: {} for next {} days", user.getUsername(), days);
        LocalDate endDate = LocalDate.now().plusDays(days);
        return taskRepository.findByUserAndDueDateBetween(user, LocalDate.now(), endDate);
    }

    public List<Task> getTasksByCategory(User user, String category) {
        log.info("Fetching tasks by category: {} for user: {}", category, user.getUsername());
        return taskRepository.findByUserAndCategory(user, category);
    }

    public List<Task> getTasksByPriority(User user, Priority priority) {
        log.info("Fetching tasks by priority: {} for user: {}", priority, user.getUsername());
        return taskRepository.findByUserAndPriority(user, priority);
    }

    public List<Task> getTaskHistory(User user, LocalDate start, LocalDate end) {
        log.info("Fetching task history for user: {} from {} to {}", user.getUsername(), start, end);
        return taskRepository.findByUserAndDueDateBetween(user, start, end);
    }

    public Task markTaskComplete(Long taskId, User user) {
        log.info("Marking task {} as complete for user: {}", taskId, user.getUsername());

        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);
        log.info("Task {} marked as complete", taskId);
        return savedTask;
    }

    public Task markTaskIncomplete(Long taskId, User user) {
        log.info("Marking task {} as incomplete for user: {}", taskId, user.getUsername());

        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setCompleted(false);
        task.setCompletedAt(null);

        Task savedTask = taskRepository.save(task);
        log.info("Task {} marked as incomplete", taskId);
        return savedTask;
    }

    public void deleteTask(Long taskId, User user) {
        log.info("Deleting task {} for user: {}", taskId, user.getUsername());

        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        taskRepository.delete(task);
        log.info("Task {} deleted successfully", taskId);
    }

    public Task updateTask(Long taskId, TaskRequest request, User user) {
        log.info("Updating task {} for user: {}", taskId, user.getUsername());

        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority());
        task.setRepeatType(request.getRepeatType());
        task.setCategory(request.getCategory());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setActualHours(request.getActualHours());

        Task savedTask = taskRepository.save(task);
        log.info("Task {} updated successfully", taskId);
        return savedTask;
    }

    public Task archiveTask(Long taskId, User user) {
        log.info("Archiving task {} for user: {}", taskId, user.getUsername());

        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setArchived(true);

        Task savedTask = taskRepository.save(task);
        log.info("Task {} archived successfully", taskId);
        return savedTask;
    }

    // Analytics methods
    public Map<String, Object> getTaskAnalytics(User user) {
        log.info("Generating task analytics for user: {}", user.getUsername());

        List<Task> allTasks = taskRepository.findAllByUserOrderByDueDateAsc(user);

        long totalTasks = allTasks.size();
        long completedTasks = allTasks.stream().filter(Task::isCompleted).count();
        long overdueTasks = allTasks.stream().filter(Task::isOverdue).count();
        long todayTasks = allTasks.stream().filter(Task::isDueToday).count();

        Map<Priority, Long> tasksByPriority = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getPriority, Collectors.counting()));

        Map<String, Long> tasksByCategory = allTasks.stream()
                .filter(task -> task.getCategory() != null)
                .collect(Collectors.groupingBy(Task::getCategory, Collectors.counting()));

        double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;

        Map<String, Object> analytics = Map.of(
                "totalTasks", totalTasks,
                "completedTasks", completedTasks,
                "overdueTasks", overdueTasks,
                "todayTasks", todayTasks,
                "completionRate", Math.round(completionRate * 100.0) / 100.0,
                "tasksByPriority", tasksByPriority,
                "tasksByCategory", tasksByCategory);

        log.info("Analytics generated for user: {}", user.getUsername());
        return analytics;
    }

    public List<String> getTaskCategories(User user) {
        log.info("Fetching task categories for user: {}", user.getUsername());
        return taskRepository.findDistinctCategoriesByUser(user);
    }
}
