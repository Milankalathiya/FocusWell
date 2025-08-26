package com.focuswell.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "recipes")
public class Recipe {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  // MVP: store as JSON string; can be normalized later
  @Lob
  private String ingredientsJson; // [{foodId, qty, unit}]

  private Integer servings;

  private Double caloriesPerServing;
  private Double proteinG;
  private Double carbsG;
  private Double fatG;

  @Lob
  private String steps;

  @ElementCollection
  @CollectionTable(name = "recipe_tags", joinColumns = @JoinColumn(name = "recipe_id"))
  @Column(name = "tag", length = 50)
  private List<String> tags = new ArrayList<>();

  private Long createdByUserId;

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
