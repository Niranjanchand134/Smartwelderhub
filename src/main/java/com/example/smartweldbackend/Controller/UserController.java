package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.UserRepository;
import com.example.smartweldbackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Get current user's role from token
     */
    @GetMapping("/role")
    public ResponseEntity<?> getCurrentUserRole(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractClaim(token, claims -> {
                Object roleObj = claims.get("role");
                return roleObj != null ? roleObj.toString() : null;
            });
            String tokenType = jwtUtil.extractTokenType(token);
            boolean isAdminToken = jwtUtil.isAdminToken(token);

            Map<String, Object> response = new HashMap<>();
            response.put("email", email);
            response.put("role", role);
            response.put("tokenType", tokenType);
            response.put("isAdminToken", isAdminToken);

            // Also check database role
            Optional<user> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                response.put("databaseRole", userOpt.get().getRole());
                response.put("roleMatch", role != null && role.equalsIgnoreCase(userOpt.get().getRole()));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get user role: " + e.getMessage());
        }
    }

    /**
     * Get user details by ID
     * Users can only get their own profile, or admins can get any user's profile
     */
    @PostMapping("/getUserDetailsById/{id}")
    public ResponseEntity<?> getUserDetailsById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractClaim(token, claims -> {
                Object roleObj = claims.get("role");
                return roleObj != null ? roleObj.toString() : null;
            });

            // Get the requesting user
            Optional<user> requestingUserOpt = userRepository.findByEmail(email);
            if (!requestingUserOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            user requestingUser = requestingUserOpt.get();
            
            // Get the target user
            Optional<user> targetUserOpt = userRepository.findById(id);
            if (!targetUserOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            user targetUser = targetUserOpt.get();

            // Check authorization: users can only get their own profile, admins can get any profile
            boolean isAdmin = "ADMIN".equalsIgnoreCase(requestingUser.getRole());
            boolean isOwnProfile = requestingUser.getId().equals(id);

            if (!isAdmin && !isOwnProfile) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You are not authorized to view this user's profile");
            }

            // Build response without password
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", targetUser.getId());
            userData.put("fullName", targetUser.getFullName());
            userData.put("email", targetUser.getEmail());
            userData.put("phoneNumber", targetUser.getPhoneNumber());
            userData.put("role", targetUser.getRole());
            userData.put("status", targetUser.getStatus());
            userData.put("profileImage", targetUser.getProfileImage());
            userData.put("skills", targetUser.getSkills());
            userData.put("experience", targetUser.getExperience());
            userData.put("createdAt", targetUser.getCreatedAt());
            userData.put("lastLogin", targetUser.getLastLogin());

            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get user details: " + e.getMessage());
        }
    }

    /**
     * Update user profile
     * Users can only update their own profile
     */
    @PutMapping("/updateProfile/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updateData,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            // Get the requesting user
            Optional<user> requestingUserOpt = userRepository.findByEmail(email);
            if (!requestingUserOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            user requestingUser = requestingUserOpt.get();
            
            // Get the target user
            Optional<user> targetUserOpt = userRepository.findById(id);
            if (!targetUserOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            user targetUser = targetUserOpt.get();

            // Check authorization: users can only update their own profile
            boolean isOwnProfile = requestingUser.getId().equals(id);
            if (!isOwnProfile) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You are not authorized to update this user's profile");
            }

            // Update allowed fields
            if (updateData.containsKey("fullName")) {
                targetUser.setFullName((String) updateData.get("fullName"));
            }
            if (updateData.containsKey("phoneNumber")) {
                targetUser.setPhoneNumber((String) updateData.get("phoneNumber"));
            }
            if (updateData.containsKey("profileImage")) {
                targetUser.setProfileImage((String) updateData.get("profileImage"));
            }
            if (updateData.containsKey("skills")) {
                // Skills can be a string (comma-separated) or array
                Object skillsObj = updateData.get("skills");
                if (skillsObj instanceof String) {
                    targetUser.setSkills((String) skillsObj);
                } else if (skillsObj instanceof java.util.List) {
                    @SuppressWarnings("unchecked")
                    java.util.List<String> skillsList = (java.util.List<String>) skillsObj;
                    targetUser.setSkills(String.join(",", skillsList));
                }
            }
            if (updateData.containsKey("experience")) {
                Object expObj = updateData.get("experience");
                if (expObj instanceof Number) {
                    targetUser.setExperience(((Number) expObj).doubleValue());
                } else if (expObj instanceof String) {
                    try {
                        targetUser.setExperience(Double.parseDouble((String) expObj));
                    } catch (NumberFormatException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Invalid experience format");
                    }
                }
            }

            // Save updated user
            user savedUser = userRepository.save(targetUser);

            // Build response without password
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("fullName", savedUser.getFullName());
            userData.put("email", savedUser.getEmail());
            userData.put("phoneNumber", savedUser.getPhoneNumber());
            userData.put("role", savedUser.getRole());
            userData.put("status", savedUser.getStatus());
            userData.put("profileImage", savedUser.getProfileImage());
            userData.put("skills", savedUser.getSkills());
            userData.put("experience", savedUser.getExperience());
            userData.put("createdAt", savedUser.getCreatedAt());
            userData.put("lastLogin", savedUser.getLastLogin());

            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update profile: " + e.getMessage());
        }
    }
}

