package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserAdminController {

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody user updatedUser) {
        user existing = userRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        existing.setFullName(updatedUser.getFullName());
        existing.setEmail(updatedUser.getEmail());
        
        // Normalize role to uppercase for consistency
        String role = updatedUser.getRole();
        if (role != null) {
            role = role.trim().toUpperCase();
            existing.setRole(role);
            System.out.println("User role updated - ID: " + id + ", Email: " + existing.getEmail() + ", New Role: " + role);
        }
        
        userRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

