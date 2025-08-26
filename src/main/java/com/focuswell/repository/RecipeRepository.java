package com.focuswell.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.focuswell.model.Recipe;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

  @Query("SELECT r FROM Recipe r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :q, '%'))")
  List<Recipe> searchByTitle(@Param("q") String q);
}
