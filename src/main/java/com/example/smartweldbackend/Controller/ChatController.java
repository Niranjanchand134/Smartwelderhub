package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.Chat;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.ChatRepository;
import com.example.smartweldbackend.service.ChatService;
import com.example.smartweldbackend.service.FileStorageService;
import com.example.smartweldbackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private FileStorageService fileStorageService;

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

    private String getRoleFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractClaim(token, claims -> {
            Object roleObj = claims.get("role");
            if (roleObj == null) {
                return null;
            }
            return roleObj.toString().trim();
        });
    }

    // Send a message (text only)
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            Long senderId = getUserIdFromToken(authHeader);
            Long receiverId = Long.valueOf(request.get("receiverId").toString());
            String message = request.get("message") != null ? request.get("message").toString() : null;

            Chat chat = chatService.sendMessage(senderId, receiverId, message);
            
            // Return chat with sender/receiver info
            Map<String, Object> response = new HashMap<>();
            response.put("id", chat.getId());
            response.put("message", chat.getMessage());
            response.put("imageUrl", chat.getImageUrl());
            response.put("isRead", chat.getIsRead());
            response.put("createdAt", chat.getCreatedAt());
            response.put("senderId", chat.getSender().getId());
            response.put("senderName", chat.getSender().getFullName());
            response.put("receiverId", chat.getReceiver().getId());
            response.put("receiverName", chat.getReceiver().getFullName());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send message: " + e.getMessage());
        }
    }

    // Send a message with image
    @PostMapping(value = "/send-with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> sendMessageWithImage(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("receiverId") Long receiverId,
            @RequestParam(value = "message", required = false) String message,
            @RequestParam("image") MultipartFile image) {
        try {
            Long senderId = getUserIdFromToken(authHeader);
            
            // Upload image
            String imageUrl = fileStorageService.storeFile(image);
            
            // Create chat message with image
            Chat chat = chatService.sendMessageWithImage(senderId, receiverId, message, imageUrl);
            
            // Return chat with sender/receiver info
            Map<String, Object> response = new HashMap<>();
            response.put("id", chat.getId());
            response.put("message", chat.getMessage());
            response.put("imageUrl", chat.getImageUrl());
            response.put("isRead", chat.getIsRead());
            response.put("createdAt", chat.getCreatedAt());
            response.put("senderId", chat.getSender().getId());
            response.put("senderName", chat.getSender().getFullName());
            response.put("receiverId", chat.getReceiver().getId());
            response.put("receiverName", chat.getReceiver().getFullName());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send message: " + e.getMessage());
        }
    }

    // Get conversations for welder (all users they've chatted with)
    @GetMapping("/welder/conversations")
    public ResponseEntity<?> getWelderConversations(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long welderId = getUserIdFromToken(authHeader);
            String role = getRoleFromToken(authHeader);
            
            if (!"WELDER".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Welder access required");
            }

            List<Chat> conversations = chatService.getWelderConversations(welderId);
            
            // Group by other participant and get latest message
            Map<Long, Map<String, Object>> conversationMap = new HashMap<>();
            for (Chat chat : conversations) {
                Long otherUserId = chat.getSender().getId().equals(welderId) 
                    ? chat.getReceiver().getId() 
                    : chat.getSender().getId();
                
                user otherUser = chat.getSender().getId().equals(welderId) 
                    ? chat.getReceiver() 
                    : chat.getSender();
                
                // Check if this is a newer message or first message for this user
                if (!conversationMap.containsKey(otherUserId)) {
                    Map<String, Object> conv = new HashMap<>();
                    conv.put("id", otherUserId);
                    conv.put("customer", otherUser.getFullName());
                    conv.put("customerId", otherUserId);
                    conv.put("lastMessage", chat.getMessage());
                    conv.put("time", chat.getCreatedAt());
                    // Check unread messages for this specific conversation
                    List<Chat> unreadMsgs = chatRepository.findMessagesBetweenUsers(welderId, otherUserId)
                            .stream()
                            .filter(c -> c.getReceiver().getId().equals(welderId) && !c.getIsRead())
                            .collect(Collectors.toList());
                    conv.put("unread", !unreadMsgs.isEmpty());
                    conversationMap.put(otherUserId, conv);
                } else {
                    // Update if this message is newer
                    Map<String, Object> existing = conversationMap.get(otherUserId);
                    if (chat.getCreatedAt().isAfter((java.time.LocalDateTime) existing.get("time"))) {
                        existing.put("lastMessage", chat.getMessage());
                        existing.put("time", chat.getCreatedAt());
                    }
                }
            }
            
            return ResponseEntity.ok(new java.util.ArrayList<>(conversationMap.values()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch conversations: " + e.getMessage());
        }
    }

    // Get conversation messages between welder and a specific user
    @GetMapping("/welder/conversation/{userId}")
    public ResponseEntity<?> getWelderConversation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long userId) {
        try {
            Long welderId = getUserIdFromToken(authHeader);
            String role = getRoleFromToken(authHeader);
            
            if (!"WELDER".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Welder access required");
            }

            List<Chat> messages = chatService.getConversationWithUser(welderId, userId);
            
            // Mark messages as read
            chatService.markMessagesAsRead(welderId, userId);
            
            List<Map<String, Object>> response = messages.stream().map(chat -> {
                Map<String, Object> msg = new HashMap<>();
                msg.put("id", chat.getId());
                msg.put("text", chat.getMessage());
                msg.put("imageUrl", chat.getImageUrl());
                msg.put("sender", chat.getSender().getId().equals(welderId) ? "welder" : "customer");
                msg.put("time", chat.getCreatedAt());
                msg.put("isRead", chat.getIsRead());
                return msg;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch conversation: " + e.getMessage());
        }
    }

    // Get conversations for user (their conversation with welder)
    @GetMapping("/user/conversations")
    public ResponseEntity<?> getUserConversations(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            
            // Get available welders
            List<user> welders = chatService.getAvailableWelders();
            
            Map<String, Object> response = new HashMap<>();
            if (!welders.isEmpty()) {
                user welder = welders.get(0); // Get first available welder
                List<Chat> messages = chatService.getConversationWithWelder(userId, welder.getId());
                
                response.put("welderId", welder.getId());
                response.put("welderName", welder.getFullName());
                response.put("messages", messages.stream().map(chat -> {
                    Map<String, Object> msg = new HashMap<>();
                    msg.put("id", chat.getId());
                    msg.put("text", chat.getMessage());
                    msg.put("imageUrl", chat.getImageUrl());
                    msg.put("sender", chat.getSender().getId().equals(userId) ? "customer" : "welder");
                    msg.put("time", chat.getCreatedAt());
                    msg.put("isRead", chat.getIsRead());
                    return msg;
                }).collect(Collectors.toList()));
            } else {
                response.put("welderId", null);
                response.put("welderName", null);
                response.put("messages", List.of());
            }
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch conversations: " + e.getMessage());
        }
    }

    // Get unread message count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            Long count = chatService.getUnreadCount(userId);
            
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch unread count: " + e.getMessage());
        }
    }

    // Mark messages as read
    @PutMapping("/mark-read/{otherUserId}")
    public ResponseEntity<?> markMessagesAsRead(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long otherUserId) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            chatService.markMessagesAsRead(userId, otherUserId);
            return ResponseEntity.ok("Messages marked as read");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to mark messages as read: " + e.getMessage());
        }
    }
}

