package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.Product;
import com.example.smartweldbackend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private com.example.smartweldbackend.service.NotificationService notificationService;

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
}

