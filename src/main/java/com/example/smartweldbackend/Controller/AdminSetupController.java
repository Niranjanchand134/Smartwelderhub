package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Helper controller for admin setup and verification
 * This is for development/testing purposes
 */
@RestController
@RequestMapping("/api/admin-setup")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminSetupController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Check if admin@gmail.com exists and has ADMIN role
     */
    @GetMapping("/check-admin")
    public ResponseEntity<?> checkAdminUser() {
        Optional<user> adminUser = userRepository.findByEmail("admin@gmail.com");
        
        Map<String, Object> response = new HashMap<>();
        if (adminUser.isPresent()) {
            user user = adminUser.get();
            response.put("exists", true);
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("id", user.getId());
            response.put("isAdmin", "ADMIN".equalsIgnoreCase(user.getRole()));
        } else {
            response.put("exists", false);
            response.put("message", "admin@gmail.com does not exist in database");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Create or update admin@gmail.com user with ADMIN role
     * WARNING: This is for development only - should be secured in production
     */
    @PostMapping("/create-admin")
    public ResponseEntity<?> createOrUpdateAdmin(@RequestBody(required = false) Map<String, String> request) {
        String password = request != null && request.containsKey("password") 
            ? request.get("password") 
            : "admin123"; // Default password
        
        Optional<user> existingUser = userRepository.findByEmail("admin@gmail.com");
        user adminUser;
        String action;
        
        if (existingUser.isPresent()) {
            // Update existing user
            adminUser = existingUser.get();
            adminUser.setRole("ADMIN");
            adminUser.setFullName(adminUser.getFullName() != null ? adminUser.getFullName() : "Admin User");
            if (request != null && request.containsKey("password")) {
                adminUser.setPassword(passwordEncoder.encode(password));
            }
            action = "updated";
        } else {
            // Create new admin user
            adminUser = new user();
            adminUser.setEmail("admin@gmail.com");
            adminUser.setPassword(passwordEncoder.encode(password));
            adminUser.setRole("ADMIN");
            adminUser.setFullName("Admin User");
            adminUser.setPhoneNumber("9800000000");
            adminUser.setCreatedAt(LocalDateTime.now());
            action = "created";
        }
        
        user savedUser = userRepository.save(adminUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Admin user " + action + " successfully");
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());
        response.put("id", savedUser.getId());
        response.put("action", action);
        
        System.out.println("Admin user " + action + ": " + savedUser.getEmail() + " with role: " + savedUser.getRole());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Generate a random secure password
     * @param length Password length (default: 12)
     * @return Generated password
     */
    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        
        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return password.toString();
    }

    /**
     * Create a new welder user
     * Admin can create welders with email, password (optional - will be generated if not provided),
     * phone, role (WELDER), and status (ACTIVE/VERIFIED)
     */
    @PostMapping("/create-welder")
    public ResponseEntity<?> createWelder(@RequestBody Map<String, String> request) {
        try {
            // Validate required fields
            if (request == null || !request.containsKey("email")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Email is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            String fullName = request.getOrDefault("fullName", "").trim();
            String email = request.get("email").trim();
            String phone = request.getOrDefault("phone", "").trim();
            String password = request.getOrDefault("password", "").trim();
            String status = request.getOrDefault("status", "ACTIVE").trim().toUpperCase();
            String profileImage = request.getOrDefault("profileImage", "").trim();
            String skills = request.getOrDefault("skills", "").trim();
            String experienceStr = request.getOrDefault("experience", "").trim();

            // Validate full name
            if (fullName.isEmpty() || fullName.length() < 2) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Full name must be at least 2 characters");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Validate email format (basic validation)
            if (email.isEmpty() || !email.contains("@")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Invalid email format");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Validate skills
            if (skills.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "At least one skill/specialization is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Validate experience
            Double experience = null;
            if (experienceStr.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Experience is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            try {
                experience = Double.parseDouble(experienceStr);
                if (experience < 0) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("success", false);
                    errorResponse.put("message", "Experience must be a positive number");
                    return ResponseEntity.badRequest().body(errorResponse);
                }
            } catch (NumberFormatException e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Invalid experience value. Please enter a valid number.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Check if user already exists
            if (userRepository.existsByEmail(email)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "User with this email already exists");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Generate password if not provided
            boolean passwordGenerated = password.isEmpty();
            if (passwordGenerated) {
                password = generateRandomPassword(12);
            }

            // Validate status
            if (!status.equals("ACTIVE") && !status.equals("VERIFIED")) {
                status = "ACTIVE"; // Default to ACTIVE if invalid
            }

            // Create new welder user
            user welderUser = new user();
            welderUser.setFullName(fullName);
            welderUser.setEmail(email);
            welderUser.setPassword(passwordEncoder.encode(password));
            welderUser.setPhoneNumber(phone);
            welderUser.setRole("WELDER");
            welderUser.setStatus(status);
            welderUser.setCreatedAt(LocalDateTime.now());
            
            // Set optional fields
            if (!profileImage.isEmpty()) {
                welderUser.setProfileImage(profileImage);
            }
            welderUser.setSkills(skills);
            welderUser.setExperience(experience);

            user savedUser = userRepository.save(welderUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Welder created successfully");
            response.put("fullName", savedUser.getFullName());
            response.put("email", savedUser.getEmail());
            response.put("phone", savedUser.getPhoneNumber());
            response.put("role", savedUser.getRole());
            response.put("status", savedUser.getStatus());
            response.put("id", savedUser.getId());
            response.put("skills", savedUser.getSkills());
            response.put("experience", savedUser.getExperience());
            response.put("passwordGenerated", passwordGenerated);
            
            // Include password in response if it was generated (for admin to share with welder)
            if (passwordGenerated) {
                response.put("generatedPassword", password);
            }

            System.out.println("Welder created: " + savedUser.getEmail() + " with role: " + savedUser.getRole() + ", status: " + savedUser.getStatus());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error creating welder: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}

