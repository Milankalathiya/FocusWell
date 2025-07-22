package com.focuswell.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.focuswell.model.HabitLog;
import com.focuswell.model.Task;
import com.focuswell.model.User;
import com.focuswell.model.WellnessData;
import com.focuswell.repository.HabitLogRepository;
import com.focuswell.security.CustomUserDetails;
import com.focuswell.service.TaskService;
import com.focuswell.service.UserService;
import com.focuswell.service.WellnessDataService;

@RestController
@RequestMapping("/api/ai")
public class AiInsightsController {

  @Autowired
  private WellnessDataService wellnessDataService;
  @Autowired
  private TaskService taskService;
  @Autowired
  private UserService userService;
  @Autowired
  private HabitLogRepository habitLogRepository;
  @Value("${AI_SERVICE_URL}")
  private String aiServiceBase;

  @PostMapping("/insights")
  public ResponseEntity<?> getAiInsights(@AuthenticationPrincipal CustomUserDetails userDetails) {
    Long userId = userDetails.getId();
    User user = userService.findById(userId);

    // 1. Gather user data
    List<WellnessData> wellnessData = wellnessDataService.getAllWellnessData(userId);
    List<Task> tasks = taskService.getAllTasks(user);
    List<HabitLog> habitLogs = habitLogRepository.findByUser(user);

    // 2. Build a JSON object to send to Python AI service
    Map<String, Object> aiRequest = new HashMap<>();
    aiRequest.put("wellnessData", wellnessData);
    aiRequest.put("tasks", tasks);
    aiRequest.put("habitLogs", habitLogs);

    // 3. Send to Python AI service (configurable URL)
    RestTemplate restTemplate = new RestTemplate();
    //String aiServiceBase = Optional.ofNullable(System.getenv("AI_SERVICE_URL")).orElse("http://localhost:5001");
    String aiServiceUrl = aiServiceBase + "/analyze";
    Map<String, Object> aiResponse = restTemplate.postForObject(aiServiceUrl, aiRequest, Map.class);

    // 4. Return AI insights to frontend
    return ResponseEntity.ok(aiResponse);
  }

  @PostMapping("/chat")
  public ResponseEntity<?> chatWithAi(@AuthenticationPrincipal CustomUserDetails userDetails,
      @RequestBody Map<String, Object> payload) {
    String message = (String) payload.get("message");
    List<Map<String, Object>> history = (List<Map<String, Object>>) payload.get("history");
    Map<String, Object> aiRequest = new HashMap<>();
    aiRequest.put("message", message);
    aiRequest.put("history", history);
    RestTemplate restTemplate = new RestTemplate();
    // String aiServiceBase = Optional.ofNullable(System.getenv("AI_SERVICE_URL")).orElse("http://localhost:5001");
    String aiServiceUrl = aiServiceBase + "/chat";
    Map<String, Object> aiResponse = restTemplate.postForObject(aiServiceUrl, aiRequest, Map.class);
    return ResponseEntity.ok(aiResponse);
  }

  @GetMapping("/chat")
  public ResponseEntity<?> chatGetDebug() {
      return ResponseEntity.badRequest().body("Use POST for chat endpoint");
  }
}
