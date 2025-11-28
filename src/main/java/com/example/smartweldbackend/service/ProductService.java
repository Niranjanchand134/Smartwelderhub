package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.Product;
import com.example.smartweldbackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id)
                .map(existing -> {
                    existing.setName(updatedProduct.getName());
                    existing.setCategory(updatedProduct.getCategory());
                    existing.setPrice(updatedProduct.getPrice());
                    existing.setStock(updatedProduct.getStock());
                    existing.setDescription(updatedProduct.getDescription());
                    existing.setImageUrl(updatedProduct.getImageUrl());
                    return productRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public void deductStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
        
        if (product.getStock() == null || product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName() + 
                    ". Available: " + (product.getStock() != null ? product.getStock() : 0) + 
                    ", Requested: " + quantity);
        }
        
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
    }

    public boolean checkStockAvailability(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
        
        return product.getStock() != null && product.getStock() >= quantity;
    }
}

