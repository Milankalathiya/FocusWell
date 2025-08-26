package com.focuswell.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FeatureFlags {

  private final boolean nutritionEnabled;

  public FeatureFlags(@Value("${feature.nutrition.enabled:false}") boolean nutritionEnabled) {
    this.nutritionEnabled = nutritionEnabled;
  }

  public boolean isNutritionEnabled() {
    return nutritionEnabled;
  }
}
