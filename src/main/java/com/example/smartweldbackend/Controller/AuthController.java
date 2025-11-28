package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.service.UserService;
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
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

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
}

