package com.focuswell.model;

import java.time.LocalDate;
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
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "nutrition_profiles")
public class NutritionProfile {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(length = 10)
  private String sex; // male | female | other

  private LocalDate birthdate;

  @NotNull
  private Double heightCm;

  @NotNull
  private Double weightKg;

  @Column(length = 20)
  private String activityLevel; // sedentary | light | moderate | very | extreme

  @Column(length = 30)
  private String dietaryPref; // omnivore | vegetarian | ...

  @ElementCollection
  @CollectionTable(name = "nutrition_profile_allergies", joinColumns = @JoinColumn(name = "profile_id"))
  @Column(name = "allergy", length = 100)
  private List<String> allergies = new ArrayList<>();

  @Column(length = 15)
  private String goal; // lose | maintain | gain

  private Double targetWeightKg;

  private LocalDate targetDate;

  @Column(length = 10)
  private String units; // metric | imperial

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
