package com.focuswell.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.focuswell.model.Food;

public interface FoodRepository extends JpaRepository<Food, Long> {

  @Query("SELECT f FROM Food f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :q, '%'))")
  List<Food> searchByName(@Param("q") String q);

  @Query("SELECT f FROM Food f WHERE f.calories BETWEEN :minCal AND :maxCal")
  List<Food> findByCaloriesBetween(@Param("minCal") double minCal, @Param("maxCal") double maxCal);
}
