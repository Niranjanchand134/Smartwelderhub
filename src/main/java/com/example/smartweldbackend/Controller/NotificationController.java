package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.Notification;
import com.example.smartweldbackend.service.NotificationService;
import com.example.smartweldbackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/user")
    public ResponseEntity<?> getUserNotifications(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
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
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID not found in token");
            }

            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch notifications: " + e.getMessage());
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminNotifications(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            String token = authHeader.substring(7);
            String role = jwtUtil.extractClaim(token, claims -> {
                Object roleObj = claims.get("role");
                if (roleObj == null) {
                    return null;
                }
                String roleStr = roleObj.toString().trim();
                return roleStr.isEmpty() ? null : roleStr;
            });

            // More flexible role check - handle various admin role formats
            boolean isAdmin = role != null && (
                "ADMIN".equalsIgnoreCase(role) || 
                "admin".equalsIgnoreCase(role) ||
                role.toUpperCase().contains("ADMIN")
            );

            if (!isAdmin) {
                System.out.println("Admin access denied. Role from token: '" + role + "'");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Admin access required. Current role: " + (role != null ? role : "null"));
            }

            // Get admin user ID
            Long userId = jwtUtil.extractClaim(token, claims -> {
                Object idObj = claims.get("id");
                if (idObj instanceof Number) {
                    return ((Number) idObj).longValue();
                }
                return null;
            });

            // Get both admin and user notifications for admin
            List<Notification> notifications = userId != null 
                ? notificationService.getAllNotificationsForAdmin(userId)
                : notificationService.getAdminNotifications();
            
            return ResponseEntity.ok(notifications);
        } catch (io.jsonwebtoken.JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired token: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch notifications: " + e.getMessage());
        }
    }

    @GetMapping("/user/unread-count")
    public ResponseEntity<?> getUserUnreadCount(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
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
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID not found in token");
            }

            Long count = notificationService.getUnreadCountForUser(userId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch unread count: " + e.getMessage());
        }
    }

    @GetMapping("/admin/unread-count")
    public ResponseEntity<?> getAdminUnreadCount(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            String token = authHeader.substring(7);
            String role = jwtUtil.extractClaim(token, claims -> {
                Object roleObj = claims.get("role");
                if (roleObj == null) {
                    return null;
                }
                String roleStr = roleObj.toString().trim();
                return roleStr.isEmpty() ? null : roleStr;
            });

            // More flexible role check - handle various admin role formats
            boolean isAdmin = role != null && (
                "ADMIN".equalsIgnoreCase(role) || 
                "admin".equalsIgnoreCase(role) ||
                role.toUpperCase().contains("ADMIN")
            );

            if (!isAdmin) {
                System.out.println("Admin access denied. Role from token: '" + role + "'");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Admin access required. Current role: " + (role != null ? role : "null"));
            }

            // Get admin user ID
            Long userId = jwtUtil.extractClaim(token, claims -> {
                Object idObj = claims.get("id");
                if (idObj instanceof Number) {
                    return ((Number) idObj).longValue();
                }
                return null;
            });

            // Get unread count for both admin and user notifications
            Long count = userId != null 
                ? notificationService.getAllUnreadCountForAdmin(userId)
                : notificationService.getUnreadCountForAdmin();
            
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (io.jsonwebtoken.JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired token: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch unread count: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id,
                                        @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to mark notification as read: " + e.getMessage());
        }
    }

    @PutMapping("/user/mark-all-read")
    public ResponseEntity<?> markAllAsReadForUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
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
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID not found in token");
            }

            notificationService.markAllAsReadForUser(userId);
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to mark all as read: " + e.getMessage());
        }
    }

    @PutMapping("/admin/mark-all-read")
    public ResponseEntity<?> markAllAsReadForAdmin(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            String token = authHeader.substring(7);
            String role = jwtUtil.extractClaim(token, claims -> {
                Object roleObj = claims.get("role");
                if (roleObj == null) {
                    return null;
                }
                String roleStr = roleObj.toString().trim();
                return roleStr.isEmpty() ? null : roleStr;
            });

            // More flexible role check - handle various admin role formats
            boolean isAdmin = role != null && (
                "ADMIN".equalsIgnoreCase(role) || 
                "admin".equalsIgnoreCase(role) ||
                role.toUpperCase().contains("ADMIN")
            );

            if (!isAdmin) {
                System.out.println("Admin access denied. Role from token: '" + role + "'");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Admin access required. Current role: " + (role != null ? role : "null"));
            }

            // Get admin user ID
            Long userId = jwtUtil.extractClaim(token, claims -> {
                Object idObj = claims.get("id");
                if (idObj instanceof Number) {
                    return ((Number) idObj).longValue();
                }
                return null;
            });

            // Mark both admin and user notifications as read
            if (userId != null) {
                notificationService.markAllAsReadForAdminUser(userId);
            } else {
                notificationService.markAllAsReadForAdmin();
            }
            
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to mark all as read: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id,
                                                @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            notificationService.deleteNotification(id);
            return ResponseEntity.ok("Notification deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete notification: " + e.getMessage());
        }
    }

    @DeleteMapping("/user/delete-all")
    public ResponseEntity<?> deleteAllUserNotifications(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
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
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID not found in token");
            }

            notificationService.deleteAllUserNotifications(userId);
            return ResponseEntity.ok("All notifications deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete all notifications: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/delete-all")
    public ResponseEntity<?> deleteAllAdminNotifications(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            String token = authHeader.substring(7);
            String role = jwtUtil.extractClaim(token, claims -> {
                Object roleObj = claims.get("role");
                if (roleObj == null) {
                    return null;
                }
                String roleStr = roleObj.toString().trim();
                return roleStr.isEmpty() ? null : roleStr;
            });

            // More flexible role check - handle various admin role formats
            boolean isAdmin = role != null && (
                "ADMIN".equalsIgnoreCase(role) || 
                "admin".equalsIgnoreCase(role) ||
                role.toUpperCase().contains("ADMIN")
            );

            if (!isAdmin) {
                System.out.println("Admin access denied. Role from token: '" + role + "'");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Admin access required. Current role: " + (role != null ? role : "null"));
            }

            // Get admin user ID
            Long userId = jwtUtil.extractClaim(token, claims -> {
                Object idObj = claims.get("id");
                if (idObj instanceof Number) {
                    return ((Number) idObj).longValue();
                }
                return null;
            });

            // Delete all admin notifications
            if (userId != null) {
                notificationService.deleteAllAdminNotifications(userId);
            } else {
                notificationService.deleteAllAdminNotifications(null);
            }
            
            return ResponseEntity.ok("All notifications deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete all notifications: " + e.getMessage());
        }
    }
}

