package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.Product;
import com.example.smartweldbackend.model.ProductReview;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.UserRepository;
import com.example.smartweldbackend.service.ProductService;
import com.example.smartweldbackend.service.ProductReviewService;
import com.example.smartweldbackend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductReviewService productReviewService;

    @Autowired
    private com.example.smartweldbackend.service.NotificationService notificationService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = authHeader.substring(7);
            Long userId = jwtUtil.extractClaim(token, claims -> {
                Object idObj = claims.get("id");
                if (idObj instanceof Number) {
                    return ((Number) idObj).longValue();
                }
                return null;
            });
            return userId;
        } catch (Exception e) {
            return null;
        }
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            if (product.getName() == null || product.getName().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Product name is required");
            }
            if (product.getCategory() == null || product.getCategory().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Category is required");
            }
            if (product.getPrice() == null || product.getPrice() < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Price must be greater than or equal to 0");
            }
            if (product.getStock() == null || product.getStock() < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Stock must be greater than or equal to 0");
            }

            Product createdProduct = productService.createProduct(product);
            
            // Notify all users about new product
            notificationService.notifyAllUsersAboutNewProduct(createdProduct.getName());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create product: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        var productOptional = productService.getProductById(id);
        if (productOptional.isPresent()) {
            return ResponseEntity.ok(productOptional.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            Product updatedProduct = productService.updateProduct(id, product);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update product: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete product: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> addReview(
            @PathVariable Long id,
            @RequestBody Map<String, Object> reviewData,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            // Get user details
            Optional<user> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            user currentUser = userOpt.get();
            String userName = currentUser.getFullName() != null ? currentUser.getFullName() : currentUser.getEmail();

            // Extract review data
            Integer rating = null;
            String comment = null;

            if (reviewData.get("rating") instanceof Number) {
                rating = ((Number) reviewData.get("rating")).intValue();
            } else if (reviewData.get("rating") instanceof String) {
                rating = Integer.parseInt((String) reviewData.get("rating"));
            }

            if (reviewData.get("comment") != null) {
                comment = reviewData.get("comment").toString();
            }

            if (rating == null || rating < 1 || rating > 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Rating must be between 1 and 5");
            }

            ProductReview review = productReviewService.addReview(id, userId, userName, rating, comment);

            // Return review with calculated average rating and count
            Map<String, Object> response = new HashMap<>();
            response.put("review", review);
            response.put("averageRating", productReviewService.getAverageRating(id));
            response.put("reviewCount", productReviewService.getReviewCount(id));

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add review: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<?> getReviews(@PathVariable Long id) {
        try {
            List<ProductReview> reviews = productReviewService.getReviewsByProductId(id);
            Double averageRating = productReviewService.getAverageRating(id);
            Long reviewCount = productReviewService.getReviewCount(id);

            Map<String, Object> response = new HashMap<>();
            response.put("reviews", reviews);
            response.put("averageRating", averageRating);
            response.put("reviewCount", reviewCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get reviews: " + e.getMessage());
        }
    }
}

