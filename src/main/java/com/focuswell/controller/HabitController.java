package com.focuswell.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.focuswell.model.Habit;
import com.focuswell.model.User;
import com.focuswell.repository.UserRepository;
import com.focuswell.service.HabitService;

@RestController
@RequestMapping("/api/habits")
public class HabitController {
    private final HabitService habitService;
    private final UserRepository userRepository; // add this

    public HabitController(HabitService habitService, UserRepository userRepository) {
        this.habitService = habitService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createHabit(@RequestBody Habit habit, Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        habit.setUser(user);
        habitService.addHabit(habit);

        return ResponseEntity.status(HttpStatus.CREATED).body(habit);
    }

    @GetMapping
    public ResponseEntity<List<Habit>> getHabits(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));

        return ResponseEntity.ok(habitService.getHabits(user)); // match the method signature
    }

}
