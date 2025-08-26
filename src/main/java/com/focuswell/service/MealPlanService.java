package com.focuswell.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.focuswell.model.NutritionProfile;
import com.focuswell.repository.FoodRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MealPlanService {

  private final FoodRepository foodRepository;
  private final NutritionService nutritionService;

  public Map<String, Object> generatePlan(NutritionProfile profile, int days, int mealsPerDay,
      Double calorieTargetOpt) {
    Map<String, Object> out = new HashMap<>();
    out.put("generatedAt", java.time.OffsetDateTime.now().toString());

    Map<String, Object> computed = nutritionService.computeTargets(profile);
    double calorieTarget = calorieTargetOpt != null ? calorieTargetOpt
        : ((Number) computed.get("calorieTarget")).doubleValue();

    double[] distribution = mealsPerDay == 4 ? new double[] { 0.25, 0.35, 0.30, 0.10 } : new double[] { 0.3, 0.4, 0.3 };

    List<Map<String, Object>> daysArr = new ArrayList<>();
    for (int i = 0; i < days; i++) {
      LocalDate date = LocalDate.now().plusDays(i);
      List<Map<String, Object>> meals = new ArrayList<>();
      String[] mealTypes = mealsPerDay == 4 ? new String[] { "breakfast", "lunch", "dinner", "snack" }
          : new String[] { "breakfast", "lunch", "dinner" };

      for (int m = 0; m < mealTypes.length; m++) {
        double perMeal = calorieTarget * distribution[m];
        double tol = perMeal * 0.12; // 12% tolerance
        double minCal = Math.max(50, perMeal - tol);
        double maxCal = perMeal + tol;
        var candidates = foodRepository.findByCaloriesBetween(minCal, maxCal);
        if (candidates.isEmpty()) {
          // fallback widen range
          candidates = foodRepository.findByCaloriesBetween(minCal * 0.7, maxCal * 1.3);
        }
        candidates.sort(Comparator
            .comparingDouble((com.focuswell.model.Food f) -> Math.abs(f.getCalories() - perMeal))
            .thenComparing(f -> f.getId()));
        if (!candidates.isEmpty()) {
          var f = candidates.get(0);
          Map<String, Object> meal = new HashMap<>();
          meal.put("mealType", mealTypes[m]);
          meal.put("title", f.getName());
          meal.put("itemType", "food");
          meal.put("id", f.getId());
          meal.put("calories", Math.round(f.getCalories()));
          meals.add(meal);
        }
      }
      double dayCal = meals.stream().mapToDouble(x -> ((Number) x.get("calories")).doubleValue()).sum();
      Map<String, Object> day = new HashMap<>();
      day.put("date", date.toString());
      day.put("meals", meals);
      day.put("dayTotals", Map.of("calories", Math.round(dayCal)));
      daysArr.add(day);
    }
    out.put("days", daysArr);
    out.put("notes", List.of("Deterministic plan generated from foods near per-meal targets"));
    return out;
  }
}
