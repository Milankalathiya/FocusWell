package com.focuswell.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.focuswell.config.FeatureFlags;
import com.focuswell.model.Food;
import com.focuswell.model.MealLog;
import com.focuswell.model.MealPlan;
import com.focuswell.model.NutritionProfile;
import com.focuswell.model.User;
import com.focuswell.model.WeightLog;
import com.focuswell.repository.FoodRepository;
import com.focuswell.repository.MealLogRepository;
import com.focuswell.repository.MealPlanRepository;
import com.focuswell.repository.RecipeRepository;
import com.focuswell.repository.UserRepository;
import com.focuswell.repository.WeightLogRepository;
import com.focuswell.service.MealPlanService;
import com.focuswell.service.NutritionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/nutrition")
@RequiredArgsConstructor
public class NutritionController {

  private final FeatureFlags featureFlags;
  private final UserRepository userRepository;
  private final NutritionService nutritionService;

  private final FoodRepository foodRepository;
  private final RecipeRepository recipeRepository;
  private final MealLogRepository mealLogRepository;
  private final WeightLogRepository weightLogRepository;
  private final MealPlanService mealPlanService;
  private final MealPlanRepository mealPlanRepository;
  private final ObjectMapper objectMapper = new ObjectMapper();

  private void ensureEnabled() {
    if (!featureFlags.isNutritionEnabled()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nutrition feature disabled");
    }
  }

  private User currentUser(Principal principal) {
    String username = principal.getName();
    return userRepository.findByUsername(username)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
  }

  @GetMapping("/mealplan/day")
  public Map<String, Object> getPlanForDay(Principal principal,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    ensureEnabled();
    User user = currentUser(principal);
    return mealPlanRepository.findByUserAndDate(user, date)
        .map(mp -> {
          try {
            return objectMapper.readValue(mp.getPlanJson(), Map.class);
          } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Bad plan JSON");
          }
        })
        .orElse(Map.of("date", date.toString(), "meals", List.of(), "dayTotals", Map.of("calories", 0)));
  }

  @GetMapping("/ping")
  public Map<String, Object> ping() {
    ensureEnabled();
    Map<String, Object> resp = new HashMap<>();
    resp.put("status", "ok");
    return resp;
  }

  // Save Meal Plan
  @PostMapping("/mealplan/save")
  public ResponseEntity<?> saveMealPlan(Principal principal, @RequestBody MealPlan mealPlan) {
    ensureEnabled();
    User user = currentUser(principal);
    mealPlan.setUser(user);
    mealPlanRepository.save(mealPlan);
    return ResponseEntity.ok("Meal plan saved successfully");
  }

  // Fetch Meal Plans for a Date Range
  @GetMapping("/mealplan/range")
  public List<MealPlan> getMealPlansForRange(
      Principal principal,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
    ensureEnabled();
    User user = currentUser(principal);
    return mealPlanRepository.findByUserAndDateBetween(user, start, end);
  }

  // ----- Profile -----
  @GetMapping("/profile")
  public Map<String, Object> getProfile(Principal principal) {
    ensureEnabled();
    User user = currentUser(principal);
    NutritionProfile profile = nutritionService.getOrCreateProfile(user);
    Map<String, Object> result = new HashMap<>();
    result.put("profile", profile);
    result.put("computed", nutritionService.computeTargets(profile));
    return result;
  }

  @PostMapping("/profile")
  public Map<String, Object> upsertProfile(Principal principal, @RequestBody NutritionProfile input) {
    ensureEnabled();
    User user = currentUser(principal);
    NutritionProfile saved = nutritionService.upsertProfile(user, input);
    Map<String, Object> result = new HashMap<>();
    result.put("profile", saved);
    result.put("computed", nutritionService.computeTargets(saved));
    return result;
  }

  @GetMapping("/calc/targets")
  public Map<String, Object> calcTargets(
      @RequestParam Double weightKg,
      @RequestParam Double heightCm,
      @RequestParam(required = false) String birthdate,
      @RequestParam(required = false) String sex,
      @RequestParam(required = false) String activityLevel,
      @RequestParam(required = false) String goal) {
    ensureEnabled();
    NutritionProfile tmp = new NutritionProfile();
    tmp.setWeightKg(weightKg);
    tmp.setHeightCm(heightCm);
    if (birthdate != null && !birthdate.isBlank()) {
      tmp.setBirthdate(java.time.LocalDate.parse(birthdate));
    }
    tmp.setSex(sex);
    tmp.setActivityLevel(activityLevel);
    tmp.setGoal(goal);
    Map<String, Object> result = new HashMap<>();
    result.putAll(nutritionService.computeTargets(tmp));
    result.put("warnings", java.util.List.of());
    return result;
  }

  // ----- Meal Plan -----
  @PostMapping("/mealplan/generate")
  public Map<String, Object> generatePlan(Principal principal, @RequestBody Map<String, Object> req) {
    ensureEnabled();
    User user = currentUser(principal);
    NutritionProfile profile = nutritionService.getOrCreateProfile(user);
    int days = ((Number) req.getOrDefault("days", 1)).intValue();
    int mealsPerDay = ((Number) req.getOrDefault("mealsPerDay", 4)).intValue();
    Double calorieTarget = req.get("calorieTarget") instanceof Number n ? n.doubleValue() : null;
    Map<String, Object> plan = mealPlanService.generatePlan(profile, days, mealsPerDay, calorieTarget);
    // persist each day
    List<Map<String, Object>> daysArr = (List<Map<String, Object>>) plan.get("days");
    for (Map<String, Object> day : daysArr) {
      LocalDate date = LocalDate.parse((String) day.get("date"));
      MealPlan mp = mealPlanRepository.findByUserAndDate(user, date).orElseGet(() -> {
        MealPlan x = new MealPlan();
        x.setUser(user);
        x.setDate(date);
        return x;
      });
      try {
        mp.setPlanJson(objectMapper.writeValueAsString(day));
      } catch (Exception e) {
        /* ignore */ }
      mealPlanRepository.save(mp);
    }
    return plan;
  }

  @GetMapping("/mealplan/day")
  public Map<String, Object> getPlanForDay(Principal principal,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    ensureEnabled();
    User user = currentUser(principal);
    return mealPlanRepository.findByUserAndDate(user, date)
        .map(mp -> {
          try {
            return objectMapper.readValue(mp.getPlanJson(), Map.class);
          } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Bad plan JSON");
          }
        })
        .orElse(Map.of("date", date.toString(), "meals", List.of(), "dayTotals", Map.of("calories", 0)));
  }

  // ----- Foods (read + create simple) -----
  @GetMapping("/foods")
  public List<Food> searchFoods(@RequestParam(required = false, defaultValue = "") String q) {
    ensureEnabled();
    if (q == null || q.isBlank())
      return foodRepository.findAll();
    return foodRepository.searchByName(q);
  }

  @PostMapping("/foods")
  public Food createFood(@RequestBody Food food) {
    ensureEnabled();
    return foodRepository.save(food);
  }

  @GetMapping("/foods/{id}")
  public Food getFood(@PathVariable Long id) {
    ensureEnabled();
    return foodRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found"));
  }

  // ----- Meals -----
  @PostMapping("/meals")
  public MealLog logMeal(Principal principal, @RequestBody Map<String, Object> payload) {
    ensureEnabled();
    User user = currentUser(principal);
    MealLog log = new MealLog();
    log.setUser(user);
    log.setDate(LocalDate.parse((String) payload.get("date")));
    log.setMealType((String) payload.get("mealType"));
    String itemsJson = com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
        .createObjectNode().putPOJO("items", payload.get("items")).get("items").toString();
    log.setItemsJson(itemsJson);
    double total = 0.0;
    if (payload.get("items") instanceof List<?> items) {
      for (Object o : items) {
        if (o instanceof Map<?, ?> m) {
          Object c = m.get("calories");
          if (c instanceof Number n)
            total += n.doubleValue();
        }
      }
    }
    log.setTotalCalories(total);
    return mealLogRepository.save(log);
  }

  @GetMapping("/meals/day")
  public Map<String, Object> mealsForDay(Principal principal,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    ensureEnabled();
    User user = currentUser(principal);
    List<MealLog> logs = mealLogRepository.findByUserAndDate(user, date);
    Map<String, Object> result = new HashMap<>();
    result.put("logs", logs);
    double consumed = logs.stream().mapToDouble(l -> l.getTotalCalories() == null ? 0.0 : l.getTotalCalories()).sum();
    NutritionProfile profile = nutritionService.getOrCreateProfile(user);
    double target = ((Number) nutritionService.computeTargets(profile).get("calorieTarget")).doubleValue();
    result.put("summary", Map.of("caloriesTarget", target, "caloriesConsumed", consumed));
    return result;
  }

  @DeleteMapping("/meals/{id}")
  public void deleteMeal(Principal principal, @PathVariable Long id) {
    ensureEnabled();
    mealLogRepository.deleteById(id);
  }

  // ----- Weight Logs -----
  @PostMapping("/weight")
  public WeightLog logWeight(Principal principal, @RequestBody Map<String, Object> payload) {
    ensureEnabled();
    User user = currentUser(principal);
    WeightLog w = new WeightLog();
    w.setUser(user);
    w.setDate(LocalDate.parse((String) payload.get("date")));
    Object wk = payload.get("weightKg");
    if (wk instanceof Number n)
      w.setWeightKg(n.doubleValue());
    w.setNotes((String) payload.get("notes"));
    return weightLogRepository.save(w);
  }

  @GetMapping("/weight")
  public List<WeightLog> weightSeries(Principal principal,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
    ensureEnabled();
    User user = currentUser(principal);
    return weightLogRepository.findByUserAndDateBetweenOrderByDateAsc(user, start, end);
  }

  // ----- Analytics -----
  @GetMapping("/analytics/summary")
  public Map<String, Object> getNutritionSummary(
      Principal principal,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
    ensureEnabled();
    User user = currentUser(principal);

    // Fetch profile and targets
    NutritionProfile profile = nutritionService.getOrCreateProfile(user);
    Map<String, Object> targets = nutritionService.computeTargets(profile);
    double calorieTarget = targets.get("calorieTarget") instanceof Number n ? n.doubleValue() : 2000.0;
    double proteinTarget = targets.get("proteinTarget") instanceof Number n ? n.doubleValue() : 50.0;
    double carbsTarget = targets.get("carbsTarget") instanceof Number n ? n.doubleValue() : 250.0;
    double fatTarget = targets.get("fatTarget") instanceof Number n ? n.doubleValue() : 70.0;

    // Fetch meal logs in range
    List<MealLog> mealLogs = mealLogRepository.findByUserAndDateBetween(user, start, end);

    // Aggregate per day
    Map<LocalDate, double[]> dailyTotals = new HashMap<>();
    for (MealLog log : mealLogs) {
      double calories = log.getTotalCalories() != null ? log.getTotalCalories() : 0.0;
      double protein = 0.0, carbs = 0.0, fat = 0.0;
      try {
        var items = new com.fasterxml.jackson.databind.ObjectMapper()
            .readValue(log.getItemsJson(), List.class);
        for (Object itemObj : items) {
          Map item = (Map) itemObj;
          protein += item.get("proteinG") instanceof Number n ? n.doubleValue() : 0.0;
          carbs += item.get("carbsG") instanceof Number n ? n.doubleValue() : 0.0;
          fat += item.get("fatG") instanceof Number n ? n.doubleValue() : 0.0;
        }
      } catch (Exception e) {
        /* ignore */ }
      dailyTotals.computeIfAbsent(log.getDate(), d -> new double[4]);
      dailyTotals.get(log.getDate())[0] += calories;
      dailyTotals.get(log.getDate())[1] += protein;
      dailyTotals.get(log.getDate())[2] += carbs;
      dailyTotals.get(log.getDate())[3] += fat;
    }

    // Calculate adherence
    int days = (int) (end.toEpochDay() - start.toEpochDay() + 1);
    int adherentDays = 0;
    List<Map<String, Object>> dailySummary = new ArrayList<>();
    for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
      double[] vals = dailyTotals.getOrDefault(d, new double[4]);
      boolean adherent = Math.abs(vals[0] - calorieTarget) / calorieTarget <= 0.1;
      if (adherent)
        adherentDays++;
      Map<String, Object> day = new HashMap<>();
      day.put("date", d.toString());
      day.put("calories", vals[0]);
      day.put("protein", vals[1]);
      day.put("carbs", vals[2]);
      day.put("fat", vals[3]);
      day.put("adherent", adherent);
      dailySummary.add(day);
    }
    double adherencePct = days > 0 ? (adherentDays * 100.0 / days) : 0.0;

    // Weight trend
    List<WeightLog> weightLogs = weightLogRepository.findByUserAndDateBetweenOrderByDateAsc(user, start, end);
    List<Map<String, Object>> weightTrend = new ArrayList<>();
    for (WeightLog wl : weightLogs) {
      weightTrend.add(Map.of(
          "date", wl.getDate().toString(),
          "weightKg", wl.getWeightKg()));
    }

    // Totals
    double totalCalories = dailySummary.stream().mapToDouble(d -> (double) d.get("calories")).sum();
    double totalProtein = dailySummary.stream().mapToDouble(d -> (double) d.get("protein")).sum();
    double totalCarbs = dailySummary.stream().mapToDouble(d -> (double) d.get("carbs")).sum();
    double totalFat = dailySummary.stream().mapToDouble(d -> (double) d.get("fat")).sum();

    Map<String, Object> summary = new HashMap<>();
    summary.put("days", days);
    summary.put("adherencePct", adherencePct);
    summary.put("daily", dailySummary);
    summary.put("totals", Map.of(
        "calories", totalCalories,
        "protein", totalProtein,
        "carbs", totalCarbs,
        "fat", totalFat));
    summary.put("targets", Map.of(
        "calories", calorieTarget,
        "protein", proteinTarget,
        "carbs", carbsTarget,
        "fat", fatTarget));
    summary.put("weightTrend", weightTrend);

    return summary;
  }
}
