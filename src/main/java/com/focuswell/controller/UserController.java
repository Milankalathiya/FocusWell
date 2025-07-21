package com.focuswell.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.focuswell.model.User;
import com.focuswell.repository.UserRepository;
import com.focuswell.security.CustomUserDetailsService;
import com.focuswell.security.CustomUserDetails;
import com.focuswell.security.JwtUtil;
import com.focuswell.dto.LoginRequest;
import com.focuswell.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already exists"));
        }

        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password cannot be empty"));
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for username: {}", loginRequest.getUsername());

        User user = userService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (user == null) {
            logger.warn("Login failed - invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Credentials"));
        }

        logger.info("Login successful for user: {}", user.getUsername());

        CustomUserDetails customUserDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(customUserDetails);
        logger.info("Generated JWT token: {}", token);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("tokenType", "Bearer");
        response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername()
        ));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String username = authentication.getName();
        Optional<User> optionalUser = userService.findByUsername(username);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not found"));
        }
        User user = optionalUser.get();

        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");

        if (oldPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Old and new password are required"));
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Old password is incorrect"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        logger.info("Fetching profile for user: {}", authentication != null ? authentication.getName() : "null");
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("No valid authentication found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }
            String username = authentication.getName();
            User user = userDetailsService.findByUsername(username);
            if (user == null) {
                logger.warn("User not found: {}", username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error fetching profile for user: {}", authentication.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
