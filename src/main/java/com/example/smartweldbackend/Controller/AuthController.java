package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.Otp;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.OtpRepository;
import com.example.smartweldbackend.repository.UserRepository;
import com.example.smartweldbackend.service.EmailService;
import com.example.smartweldbackend.service.UserService;
import com.example.smartweldbackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/userLogin")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            if (email == null || password == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Email and password are required");
            }

            String token = userService.loginUser(email, password);
            
            // Get user details for logging
            com.example.smartweldbackend.model.user loggedInUser = userService.getUserByEmail(email);
            boolean isAdminToken = jwtUtil.isAdminToken(token);
            
            System.out.println("=== LOGIN SUCCESS ===");
            System.out.println("Email: " + email);
            System.out.println("Role in DB: '" + loggedInUser.getRole() + "'");
            System.out.println("Token Type: " + (isAdminToken ? "ADMIN_TOKEN" : "USER_TOKEN"));
            System.out.println("======================");
            
            // Return token as string for backward compatibility with frontend
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed. Please try again.");
        }
    }

    @PostMapping("/registers")
    public ResponseEntity<?> register(@RequestBody Map<String, String> registerRequest) {
        try {
            String name = registerRequest.get("name");
            String email = registerRequest.get("email");
            String password = registerRequest.get("password");
            String number = registerRequest.get("number");
            String role = registerRequest.get("role");

            if (name == null || email == null || password == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Name, email, and password are required");
            }

            String token = userService.registerUser(name, email, password, number, role);
            
            // Return token as string to match frontend expectations
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed. Please try again.");
        }
    }

    @GetMapping("/")
    public ResponseEntity<String> greeting() {
        return ResponseEntity.ok("Welcome to SmartWeld Backend API");
    }

    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authorization header missing or invalid");
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String email = jwtUtil.extractEmail(token);

            if (jwtUtil.validateToken(token, email)) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Token is valid");
                response.put("email", email);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token: " + e.getMessage());
        }
    }

    @GetMapping("/api/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<user> users = userService.getAllUsers();
            
            // Remove password from response for security
            List<Map<String, Object>> userList = users.stream().map(u -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", u.getId());
                userMap.put("fullName", u.getFullName());
                userMap.put("email", u.getEmail());
                userMap.put("phoneNumber", u.getPhoneNumber());
                userMap.put("role", u.getRole());
                userMap.put("profileImage", u.getProfileImage());
                userMap.put("skills", u.getSkills());
                userMap.put("experience", u.getExperience());
                userMap.put("status", u.getStatus());
                userMap.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
                userMap.put("lastLogin", u.getLastLogin() != null ? u.getLastLogin().toString() : null);
                return userMap;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch users: " + e.getMessage());
        }
    }

    /**
     * Check email and send OTP
     */
    @PostMapping("/api/checkEmail")
    @Transactional
    public ResponseEntity<?> checkEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Email is required");
            }

            // Check if user exists
            Optional<user> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("This email does not exist in our system");
            }

            // Generate 5-digit OTP
            SecureRandom random = new SecureRandom();
            String otpCode = String.format("%05d", random.nextInt(100000));

            // Set expiration time (10 minutes from now)
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

            // Mark all previous OTPs for this email as used
            otpRepository.markAllAsUsedByEmail(email);

            // Save new OTP
            Otp otp = new Otp(email, otpCode, expiresAt);
            otpRepository.save(otp);

            // Send OTP via email
            emailService.sendOtpEmail(email, otpCode);

            return ResponseEntity.ok("OTP sent successfully to your email");
        } catch (Exception e) {
            System.err.println("Error in checkEmail: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send OTP: " + e.getMessage());
        }
    }

    /**
     * Verify OTP
     */
    @PostMapping("/api/checkOTP")
    public ResponseEntity<?> checkOTP(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otpCode = request.get("otp");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Email is required");
            }

            if (otpCode == null || otpCode.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("OTP is required");
            }

            // Find valid OTP
            Optional<Otp> otpOptional = otpRepository.findByEmailAndOtpCodeAndUsedFalse(email, otpCode);
            
            if (otpOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid or expired OTP");
            }

            Otp otp = otpOptional.get();

            // Check if OTP is expired
            if (otp.isExpired()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("OTP has expired. Please request a new one");
            }

            // Mark OTP as used
            otp.setUsed(true);
            otpRepository.save(otp);

            return ResponseEntity.ok("OTP verified successfully");
        } catch (Exception e) {
            System.err.println("Error in checkOTP: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to verify OTP: " + e.getMessage());
        }
    }

    /**
     * Update password after OTP verification
     */
    @PostMapping("/api/updatePassword")
    @Transactional
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("password");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Email is required");
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Password is required");
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Password must be at least 6 characters long");
            }

            // Check if user has a recently verified OTP (used within last 15 minutes)
            List<Otp> recentOtps = otpRepository.findRecentlyUsedByEmail(email);
            boolean hasRecentVerification = false;
            
            if (!recentOtps.isEmpty()) {
                Otp mostRecentOtp = recentOtps.get(0);
                LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
                if (mostRecentOtp.getCreatedAt().isAfter(fifteenMinutesAgo) && mostRecentOtp.getUsed()) {
                    hasRecentVerification = true;
                }
            }

            if (!hasRecentVerification) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Please verify OTP first before updating password");
            }

            // Update password
            userService.updatePassword(email, newPassword);

            // Mark all remaining OTPs for this email as used (cleanup)
            otpRepository.markAllAsUsedByEmail(email);

            return ResponseEntity.ok("Password updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error in updatePassword: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update password: " + e.getMessage());
        }
    }

    /**
     * Clean up expired OTPs (runs every hour)
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            otpRepository.deleteExpiredOtps(LocalDateTime.now());
            System.out.println("Expired OTPs cleaned up successfully");
        } catch (Exception e) {
            System.err.println("Error cleaning up expired OTPs: " + e.getMessage());
        }
    }
}

