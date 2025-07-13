package com.trackit.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.trackit.dto.AnalyticsResponse;
import com.trackit.dto.WellnessDataRequest;
import com.trackit.model.User;
import com.trackit.model.WellnessData;
import com.trackit.security.CustomUserDetails;
import com.trackit.service.UserService;
import com.trackit.service.WellnessDataService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/wellness")
public class WellnessController {

  @Autowired
  private WellnessDataService wellnessDataService;

  @Autowired
  private UserService userService;

  // Save or update wellness data
  @PostMapping("/data")
  public ResponseEntity<WellnessData> saveWellnessData(
      @Valid @RequestBody WellnessDataRequest request,
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    try {
      User user = userService.findById(userDetails.getId());
      WellnessData savedData = wellnessDataService.saveWellnessData(user.getId(), request);
      return ResponseEntity.ok(savedData);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  // Get wellness data for a specific date
  @GetMapping("/data")
  public ResponseEntity<WellnessData> getWellnessDataByDate(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    User user = userService.findById(userDetails.getId());
    Optional<WellnessData> data = wellnessDataService.getWellnessDataByDate(user.getId(), date);
    return data.map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  // Get all wellness data for a user
  @GetMapping("/data/all")
  public ResponseEntity<List<WellnessData>> getAllWellnessData(@AuthenticationPrincipal CustomUserDetails userDetails) {
    User user = userService.findById(userDetails.getId());
    List<WellnessData> data = wellnessDataService.getAllWellnessData(user.getId());
    return ResponseEntity.ok(data);
  }

  // Get wellness data for a date range
  @GetMapping("/data/range")
  public ResponseEntity<List<WellnessData>> getWellnessDataByDateRange(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    User user = userService.findById(userDetails.getId());
    List<WellnessData> data = wellnessDataService.getWellnessDataByDateRange(user.getId(), startDate, endDate);
    return ResponseEntity.ok(data);
  }

  // Get recent wellness data (last N days)
  @GetMapping("/data/recent")
  public ResponseEntity<List<WellnessData>> getRecentWellnessData(
      @RequestParam(defaultValue = "7") int days,
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    User user = userService.findById(userDetails.getId());
    List<WellnessData> data = wellnessDataService.getRecentWellnessData(user.getId(), days);
    return ResponseEntity.ok(data);
  }

  // Get complete wellness data (with all required fields)
  @GetMapping("/data/complete")
  public ResponseEntity<List<WellnessData>> getCompleteWellnessData(
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    User user = userService.findById(userDetails.getId());
    List<WellnessData> data = wellnessDataService.getCompleteWellnessData(user.getId());
    return ResponseEntity.ok(data);
  }

  // Get wellness statistics
  @GetMapping("/stats")
  public ResponseEntity<WellnessDataService.WellnessStats> getWellnessStats(
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    try {
      User user = userService.findById(userDetails.getId());
      WellnessDataService.WellnessStats stats = wellnessDataService.getWellnessStats(user.getId());
      return ResponseEntity.ok(stats);
    } catch (Exception e) {
      System.err.println("Error in getWellnessStats endpoint: " + e.getMessage());
      e.printStackTrace();
      // Return empty stats instead of bad request
      WellnessDataService.WellnessStats emptyStats = new WellnessDataService.WellnessStats();
      emptyStats.setTotalEntries(0L);
      emptyStats.setCurrentWellnessScore(0.0);
      emptyStats.setAverageWellnessScore(0.0);
      emptyStats.setStreakDays(0);
      return ResponseEntity.ok(emptyStats);
    }
  }

  // Check if user has data for today
  @GetMapping("/data/today")
  public ResponseEntity<Boolean> hasTodayData(@AuthenticationPrincipal CustomUserDetails userDetails) {
    User user = userService.findById(userDetails.getId());
    boolean hasData = wellnessDataService.hasTodayData(user.getId());
    return ResponseEntity.ok(hasData);
  }

  // Calculate average wellness score for a date range
  @GetMapping("/analytics/average-score")
  public ResponseEntity<Double> getAverageWellnessScore(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    User user = userService.findById(userDetails.getId());
    Double averageScore = wellnessDataService.calculateAverageWellnessScore(user.getId(), startDate, endDate);
    return ResponseEntity.ok(averageScore);
  }

  // Find days with low wellness scores
  @GetMapping("/analytics/low-score-days")
  public ResponseEntity<List<WellnessData>> getLowWellnessDays(
      @RequestParam(defaultValue = "5.0") Double threshold,
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    User user = userService.findById(userDetails.getId());
    List<WellnessData> lowScoreDays = wellnessDataService.findLowWellnessDays(user.getId(), threshold);
    return ResponseEntity.ok(lowScoreDays);
  }

  // Get comprehensive analytics
  @GetMapping("/analytics/comprehensive")
  public ResponseEntity<AnalyticsResponse> getComprehensiveAnalytics(
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    try {
      User user = userService.findById(userDetails.getId());
      // This would be implemented in a separate AnalyticsService
      // For now, return a basic response
      AnalyticsResponse response = new AnalyticsResponse();
      response.setDaysTracked(wellnessDataService.getWellnessStats(user.getId()).getTotalEntries().intValue());
      response.setHasRecentData(wellnessDataService.hasTodayData(user.getId()));

      return ResponseEntity.ok(response);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  // Debug endpoint to check today's date
  @GetMapping("/debug/today")
  public ResponseEntity<Map<String, Object>> getTodayDate() {
    Map<String, Object> response = new HashMap<>();
    response.put("today", LocalDate.now().toString());
    response.put("todayISO", LocalDate.now().toString());
    return ResponseEntity.ok(response);
  }
}
