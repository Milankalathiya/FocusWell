package com.focuswell.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.focuswell.model.NutritionProfile;
import com.focuswell.model.User;

public interface NutritionProfileRepository extends JpaRepository<NutritionProfile, Long> {
  Optional<NutritionProfile> findByUser(User user);
}
