package com.trackit.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trackit.dto.LoginRequest;
import com.trackit.model.User;
import com.trackit.repository.UserRepository;
import com.trackit.security.CustomUserDetails;
import com.trackit.security.JwtUtil;
import com.trackit.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;
    private final UserRepository userRepository;
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
        System.out.println("Login attempt for username: " + loginRequest.getUsername());

        User user = userService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (user == null) {
            System.out.println("Login failed - invalid credentials");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Credentials"));
        }

        System.out.println("Login successful for user: " + user.getUsername());

        // Create UserDetails (CustomUserDetails) from User
        CustomUserDetails customUserDetails = new CustomUserDetails(user);

        // Generate token using UserDetails
        String token = jwtUtil.generateToken(customUserDetails);
        System.out.println("Generated JWT token: " + token);

        // Return JSON response with token
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("tokenType", "Bearer");
        response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername()
        // Add other user fields you want to return
        ));

        return ResponseEntity.ok().body(response);
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
        String username = authentication.getName(); // Extracted from JWT
        Optional<User> optionalUser = userService.findByUsername(username);

        if (optionalUser.isPresent()) {
            return ResponseEntity.ok(optionalUser.get());
        } else {
            // User not found - return 404 Not Found
            return ResponseEntity.notFound().build();
        }
    }

}
