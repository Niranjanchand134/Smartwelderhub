package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.SupportChat;
import com.example.smartweldbackend.service.CustomerSupportService;
import com.example.smartweldbackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer-support")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerSupportController {

    @Autowired
    private CustomerSupportService customerSupportService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("User not authenticated");
        }
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractClaim(token, claims -> {
            Object idObj = claims.get("id");
            if (idObj instanceof Number) {
                return ((Number) idObj).longValue();
            }
            return null;
        });
        if (userId == null) {
            throw new RuntimeException("User ID not found in token");
        }
        return userId;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            String message = request.get("message") != null ? request.get("message").toString() : null;

            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Message cannot be empty");
            }

            customerSupportService.sendUserMessage(userId, message);
            
            List<SupportChat> conversation = customerSupportService.getConversation(userId);
            
            List<Map<String, Object>> response = conversation.stream().map(chat -> {
                Map<String, Object> msg = new HashMap<>();
                msg.put("id", chat.getId());
                msg.put("message", chat.getMessage());
                msg.put("isFromUser", chat.getIsFromUser());
                msg.put("createdAt", chat.getCreatedAt());
                return msg;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            // Check if it's a quota-related error
            if (errorMessage != null && errorMessage.contains("quota")) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body("AI service is temporarily unavailable due to API quota limits. Your message has been saved, and you'll receive a response when the service is restored.");
            }
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send message: " + errorMessage);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send message: " + e.getMessage());
        }
    }

    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            
            List<SupportChat> conversation = customerSupportService.getConversation(userId);
            
            List<Map<String, Object>> response = conversation.stream().map(chat -> {
                Map<String, Object> msg = new HashMap<>();
                msg.put("id", chat.getId());
                msg.put("message", chat.getMessage());
                msg.put("isFromUser", chat.getIsFromUser());
                msg.put("createdAt", chat.getCreatedAt());
                return msg;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch conversation: " + e.getMessage());
        }
    }
}

