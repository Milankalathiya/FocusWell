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
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "foods")
public class Food {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  private String brand;

  @Column(nullable = false)
  private Double servingSize; // numeric value

  @Column(nullable = false, length = 20)
  private String servingUnit; // g, ml, cup, piece

  @Column(nullable = false)
  private Double calories; // per serving

  private Double proteinG;
  private Double carbsG;
  private Double fatG;
  private Double fiberG;

  @ElementCollection
  @CollectionTable(name = "food_tags", joinColumns = @JoinColumn(name = "food_id"))
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
