package com.focuswell.dto;

import java.time.LocalDate;

import com.focuswell.model.Priority;
import com.focuswell.model.RepeatType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private Priority priority = Priority.MEDIUM;

    private RepeatType repeatType = RepeatType.NONE;

    private String category;

    private Integer estimatedHours;

    private Integer actualHours;
}
