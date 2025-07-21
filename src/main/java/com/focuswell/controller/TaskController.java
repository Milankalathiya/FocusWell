package com.focuswell.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.focuswell.dto.TaskRequest;
import com.focuswell.model.Priority;
import com.focuswell.model.Task;
import com.focuswell.model.User;
import com.focuswell.security.CustomUserDetails;
import com.focuswell.service.TaskService;
import com.focuswell.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Creating task: {}", request.getTitle());
        User user = userService.findById(userDetails.getId());
        Task createdTask = taskService.createTask(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Fetching all tasks for user: {}", userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        List<Task> tasks = taskService.getAllTasks(user);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/today")
    public ResponseEntity<List<Task>> getTodayTasks(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Fetching today's tasks for user: {}", userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        List<Task> tasks = taskService.getTodayTasks(user);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Task>> getOverdueTasks(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Fetching overdue tasks for user: {}", userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        List<Task> tasks = taskService.getOverdueTasks(user);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Task>> getUpcomingTasks(
            @RequestParam(defaultValue = "7") int days,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Fetching upcoming tasks for user: {} for next {} days", userDetails.getUsername(), days);
        User user = userService.findById(userDetails.getId());
        List<Task> tasks = taskService.getUpcomingTasks(user, days);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Task>> getTasksByCategory(
            @PathVariable String category,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Fetching tasks by category: {} for user: {}", category, userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        List<Task> tasks = taskService.getTasksByCategory(user, category);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Task>> getTasksByPriority(
            @PathVariable Priority priority,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Fetching tasks by priority: {} for user: {}", priority, userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        List<Task> tasks = taskService.getTasksByPriority(user, priority);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Task>> getTaskHistory(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Fetching task history for user: {} from {} to {}", userDetails.getUsername(), start, end);
        User user = userService.findById(userDetails.getId());
        List<Task> tasks = taskService.getTaskHistory(user, start, end);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Fetching task {} for user: {}", id, userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        // This would need a new method in TaskService
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Updating task {} for user: {}", id, userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        Task updatedTask = taskService.updateTask(id, request, user);
        return ResponseEntity.ok(updatedTask);
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Task> markTaskComplete(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Marking task {} as complete for user: {}", id, userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        Task task = taskService.markTaskComplete(id, user);
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/{id}/incomplete")
    public ResponseEntity<Task> markTaskIncomplete(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Marking task {} as incomplete for user: {}", id, userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        Task task = taskService.markTaskIncomplete(id, user);
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Task> archiveTask(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Archiving task {} for user: {}", id, userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        Task task = taskService.archiveTask(id, user);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Deleting task {} for user: {}", id, userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        taskService.deleteTask(id, user);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getTaskAnalytics(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Generating task analytics for user: {}", userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        Map<String, Object> analytics = taskService.getTaskAnalytics(user);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getTaskCategories(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Fetching task categories for user: {}", userDetails.getUsername());
        User user = userService.findById(userDetails.getId());
        List<String> categories = taskService.getTaskCategories(user);
        return ResponseEntity.ok(categories);
    }
}
