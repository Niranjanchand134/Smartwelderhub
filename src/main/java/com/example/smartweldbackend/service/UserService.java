package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.UserRepository;
import com.example.smartweldbackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NotificationService notificationService;

    public String registerUser(String name, String email, String password, String phoneNumber, String role) {
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with this email already exists");
        }

        // Create new user
        user newUser = new user();
        newUser.setFullName(name);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setPhoneNumber(phoneNumber);
        newUser.setRole(role != null ? role : "buyer");
        newUser.setCreatedAt(LocalDateTime.now());

        // Save user
        user savedUser = userRepository.save(newUser);

        // Notify admin about new user registration (only if not admin)
        if (!"ADMIN".equalsIgnoreCase(savedUser.getRole())) {
            notificationService.notifyAdminAboutNewUser(savedUser.getFullName(), savedUser.getEmail());
        }

        // Generate JWT token - use specific method based on role
        if ("ADMIN".equalsIgnoreCase(savedUser.getRole())) {
            return jwtUtil.generateAdminToken(savedUser.getEmail(), savedUser.getId());
        } else if ("WELDER".equalsIgnoreCase(savedUser.getRole())) {
            return jwtUtil.generateWelderToken(savedUser.getEmail(), savedUser.getId());
        } else {
            return jwtUtil.generateUserToken(savedUser.getEmail(), savedUser.getRole(), savedUser.getId());
        }
    }

    public String loginUser(String email, String password) {
        // Find user by email
        Optional<user> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        user user = userOptional.get();

        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Update last login time
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Log role for debugging
        String userRole = user.getRole();
        System.out.println("Login attempt - Email: " + email + ", Role in DB: '" + userRole + "'");
        
        // Normalize role for comparison (handle case variations)
        String normalizedRole = userRole != null ? userRole.trim().toUpperCase() : null;
        
        // Generate JWT token - use specific method based on role
        if ("ADMIN".equals(normalizedRole)) {
            System.out.println("Generating ADMIN token for: " + email);
            return jwtUtil.generateAdminToken(user.getEmail(), user.getId());
        } else if ("WELDER".equals(normalizedRole)) {
            System.out.println("Generating WELDER token for: " + email);
            return jwtUtil.generateWelderToken(user.getEmail(), user.getId());
        } else {
            System.out.println("Generating USER token for: " + email + " with role: " + userRole);
            return jwtUtil.generateUserToken(user.getEmail(), user.getRole(), user.getId());
        }
    }

    public List<user> getAllUsers() {
        return userRepository.findAll();
    }

    public user getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public void updatePassword(String email, String newPassword) {
        // Find user by email
        Optional<user> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        user user = userOptional.get();
        
        // Store old password hash for logging (for debugging only)
        String oldPasswordHash = user.getPassword();
        
        // Encode the new password
        String encodedPassword = passwordEncoder.encode(newPassword);
        
        // Update password
        user.setPassword(encodedPassword);
        
        // Save and flush to ensure immediate persistence
        user savedUser = userRepository.saveAndFlush(user);
        
        // Reload user from database to verify persistence
        userRepository.flush();
        Optional<user> reloadedUserOptional = userRepository.findByEmail(email);
        
        if (reloadedUserOptional.isEmpty()) {
            throw new RuntimeException("Failed to verify password update - user not found after save");
        }
        
        user reloadedUser = reloadedUserOptional.get();
        
        // Verify the password was saved correctly by checking if it matches
        boolean passwordMatches = passwordEncoder.matches(newPassword, reloadedUser.getPassword());
        
        System.out.println("=== PASSWORD UPDATE ===");
        System.out.println("Email: " + email);
        System.out.println("Old password hash: " + (oldPasswordHash != null ? oldPasswordHash.substring(0, Math.min(20, oldPasswordHash.length())) + "..." : "null"));
        System.out.println("New password hash: " + (reloadedUser.getPassword() != null ? reloadedUser.getPassword().substring(0, Math.min(20, reloadedUser.getPassword().length())) + "..." : "null"));
        System.out.println("Password changed: " + (!oldPasswordHash.equals(reloadedUser.getPassword())));
        System.out.println("Password verification: " + (passwordMatches ? "SUCCESS" : "FAILED"));
        System.out.println("========================");
        
        if (!passwordMatches) {
            throw new RuntimeException("Password update verification failed. Please try again.");
        }
        
        if (oldPasswordHash.equals(reloadedUser.getPassword())) {
            throw new RuntimeException("Password was not updated. Old and new password hashes are the same.");
        }
    }
}

