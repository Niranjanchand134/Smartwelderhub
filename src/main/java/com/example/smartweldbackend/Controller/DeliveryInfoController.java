package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.DeliveryInfo;
import com.example.smartweldbackend.service.DeliveryInfoService;
import com.example.smartweldbackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "http://localhost:5173")
public class DeliveryInfoController {

    @Autowired
    private DeliveryInfoService deliveryInfoService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> createDelivery(@RequestBody Map<String, Object> deliveryData,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String userEmail = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                userEmail = jwtUtil.extractEmail(token);
            } else if (deliveryData.get("email") != null) {
                userEmail = deliveryData.get("email").toString();
            }

            DeliveryInfo deliveryInfo = new DeliveryInfo();
            deliveryInfo.setFullName((String) deliveryData.get("fullName"));
            deliveryInfo.setEmail((String) deliveryData.get("email"));
            deliveryInfo.setPhone((String) deliveryData.get("phone"));
            deliveryInfo.setAddress((String) deliveryData.get("address"));
            deliveryInfo.setCity((String) deliveryData.get("city"));
            deliveryInfo.setState((String) deliveryData.get("state"));
            deliveryInfo.setLandmark((String) deliveryData.get("landmark"));
            deliveryInfo.setCountry((String) deliveryData.getOrDefault("country", "Nepal"));
            deliveryInfo.setWardNumber((String) deliveryData.get("wardNumber"));
            deliveryInfo.setAlternatePhoneNumber((String) deliveryData.get("alternatePhoneNumber"));
            deliveryInfo.setDeliveryInstructions((String) deliveryData.get("deliveryInstructions"));
            
            if (deliveryData.get("saveAddress") != null) {
                deliveryInfo.setSaveAddress(Boolean.valueOf(deliveryData.get("saveAddress").toString()));
            }

            if (deliveryInfo.getFullName() == null || deliveryInfo.getFullName().isBlank()
                    || deliveryInfo.getAddress() == null || deliveryInfo.getAddress().isBlank()
                    || deliveryInfo.getCity() == null || deliveryInfo.getCity().isBlank()
                    || deliveryInfo.getPhone() == null || deliveryInfo.getPhone().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Required delivery fields are missing");
            }
            
            DeliveryInfo saved = deliveryInfoService.createDeliveryInfo(deliveryInfo, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save delivery info: " + e.getMessage());
        }
    }

    @GetMapping("/saved")
    public ResponseEntity<?> getSavedAddresses(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            
            // Get user ID from token claims
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
            
            List<DeliveryInfo> savedAddresses = deliveryInfoService.getSavedDeliveryInfoByUserId(userId);
            return ResponseEntity.ok(savedAddresses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch saved addresses: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDelivery(@PathVariable Long id, @RequestBody DeliveryInfo deliveryInfo) {
        try {
            DeliveryInfo updated = deliveryInfoService.updateDeliveryInfo(id, deliveryInfo);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update delivery info: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<DeliveryInfo>> getAllDelivery() {
        return ResponseEntity.ok(deliveryInfoService.getAllDeliveryInfo());
    }

    @GetMapping("/by-email")
    public ResponseEntity<List<DeliveryInfo>> getByEmail(@RequestParam String email) {
        return ResponseEntity.ok(deliveryInfoService.getDeliveryInfoByEmail(email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDelivery(@PathVariable Long id,
                                           @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            
            // Get user ID from token claims
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
            
            // Verify that the delivery info belongs to the user
            DeliveryInfo deliveryInfo = deliveryInfoService.getDeliveryInfoById(id);
            if (deliveryInfo == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Delivery info not found");
            }
            
            // Check if delivery info has a user and verify ownership
            if (deliveryInfo.getUser() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Delivery info is not associated with a user");
            }
            
            if (!deliveryInfo.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to delete this address");
            }
            
            deliveryInfoService.deleteDeliveryInfo(id);
            return ResponseEntity.ok("Address deleted successfully");
        } catch (RuntimeException e) {
            // Check if it's a constraint violation (orders exist)
            if (e.getMessage() != null && e.getMessage().contains("associated with existing orders")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete delivery info: " + e.getMessage());
        }
    }
}

