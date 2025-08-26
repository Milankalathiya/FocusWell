package com.focuswell.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.focuswell.model.NutritionProfile;
import com.focuswell.model.User;
import com.focuswell.repository.NutritionProfileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NutritionService {

  private final NutritionProfileRepository profileRepository;

  public NutritionProfile getOrCreateProfile(User user) {
    return profileRepository.findByUser(user).orElseGet(() -> {
      NutritionProfile p = new NutritionProfile();
      p.setUser(user);
      p.setUnits("metric");
      p.setActivityLevel("moderate");
      p.setGoal("maintain");
      p.setHeightCm(170.0);
      p.setWeightKg(70.0);
      return profileRepository.save(p);
    });
  }

  public NutritionProfile upsertProfile(User user, NutritionProfile input) {
    NutritionProfile existing = profileRepository.findByUser(user).orElse(null);
    if (existing == null) {
      input.setUser(user);
      return profileRepository.save(input);
    } else {
      // update fields
      existing.setSex(input.getSex());
      existing.setBirthdate(input.getBirthdate());
      existing.setHeightCm(input.getHeightCm());
      existing.setWeightKg(input.getWeightKg());
      existing.setActivityLevel(input.getActivityLevel());
      existing.setDietaryPref(input.getDietaryPref());
      existing.setAllergies(input.getAllergies());
      existing.setGoal(input.getGoal());
      existing.setTargetWeightKg(input.getTargetWeightKg());
      existing.setTargetDate(input.getTargetDate());
      existing.setUnits(input.getUnits());
      return profileRepository.save(existing);
    }
  }

  public Map<String, Object> computeTargets(NutritionProfile profile) {
    Map<String, Object> result = new HashMap<>();
    int age = profile.getBirthdate() != null ? calculateAge(profile.getBirthdate()) : 30;
    double weightKg = profile.getWeightKg() != null ? profile.getWeightKg() : 70.0;
    double heightCm = profile.getHeightCm() != null ? profile.getHeightCm() : 170.0;
    String sex = profile.getSex() != null ? profile.getSex() : "other";
    String activity = profile.getActivityLevel() != null ? profile.getActivityLevel() : "moderate";
    String goal = profile.getGoal() != null ? profile.getGoal() : "maintain";

    double bmr = computeBmrMifflin(weightKg, heightCm, age, sex);
    double tdee = applyActivity(bmr, activity);
    double calorieTarget = applyGoal(tdee, goal, sex);

    Map<String, Double> macros = computeDefaultMacros(calorieTarget, goal, activity, weightKg);

    result.put("age", age);
    result.put("BMR", Math.round(bmr));
    result.put("TDEE", Math.round(tdee));
    result.put("calorieTarget", Math.round(calorieTarget));
    result.put("macros", macros);
    return result;
  }

  private int calculateAge(LocalDate birthdate) {
    return Period.between(birthdate, LocalDate.now()).getYears();
  }

  private double computeBmrMifflin(double weightKg, double heightCm, int age, String sex) {
    if ("male".equalsIgnoreCase(sex)) {
      return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else if ("female".equalsIgnoreCase(sex)) {
      return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    } else {
      // default to average of male/female
      double male = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
      double female = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
      return (male + female) / 2.0;
    }
  }

  private double applyActivity(double bmr, String activity) {
    double m = switch (activity == null ? "moderate" : activity.toLowerCase()) {
      case "sedentary" -> 1.2;
      case "light" -> 1.375;
      case "moderate" -> 1.55;
      case "very" -> 1.725;
      case "extreme" -> 1.9;
      default -> 1.55;
    };
    return bmr * m;
  }

  private double applyGoal(double tdee, String goal, String sex) {
    String g = goal == null ? "maintain" : goal.toLowerCase();
    double target;
    switch (g) {
      case "lose" -> target = tdee * 0.85; // default 15% deficit
      case "gain" -> target = tdee * 1.10; // default 10% surplus
      default -> target = tdee;
    }
    // clamp floors
    double floor = ("female".equalsIgnoreCase(sex)) ? 1200 : 1500;
    return Math.max(target, floor);
  }

  private Map<String, Double> computeDefaultMacros(double calories, String goal, String activity, double weightKg) {
    double pPct = 0.25, fPct = 0.25, cPct = 0.50;
    if ("lose".equalsIgnoreCase(goal)) {
      pPct = 0.30;
      fPct = 0.25;
      cPct = 0.45;
    } else if ("gain".equalsIgnoreCase(goal)) {
      pPct = 0.28;
      fPct = 0.22;
      cPct = 0.50;
    }
    double proteinG = (calories * pPct) / 4.0;
    double carbsG = (calories * cPct) / 4.0;
    double fatG = (calories * fPct) / 9.0;

    Map<String, Double> macros = new HashMap<>();
    macros.put("protein_g", Math.round(proteinG * 10.0) / 10.0);
    macros.put("carbs_g", Math.round(carbsG * 10.0) / 10.0);
    macros.put("fat_g", Math.round(fatG * 10.0) / 10.0);
    return macros;
  }
}
