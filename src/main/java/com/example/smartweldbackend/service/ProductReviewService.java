package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.Product;
import com.example.smartweldbackend.model.ProductReview;
import com.example.smartweldbackend.repository.ProductRepository;
import com.example.smartweldbackend.repository.ProductReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductReviewService {

    @Autowired
    private ProductReviewRepository productReviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public ProductReview addReview(Long productId, Long userId, String userName, Integer rating, String comment) {
        // Validate product exists
        Optional<Product> productOptional = productRepository.findById(productId);
        if (productOptional.isEmpty()) {
            throw new RuntimeException("Product not found with ID: " + productId);
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        // Check if user already reviewed this product
        List<ProductReview> existingReviews = productReviewRepository.findByProductIdAndUserId(productId, userId);
        if (!existingReviews.isEmpty()) {
            // Update existing review
            ProductReview existingReview = existingReviews.get(0);
            existingReview.setRating(rating);
            existingReview.setComment(comment);
            existingReview.setUserName(userName);
            return productReviewRepository.save(existingReview);
        }

        // Create new review
        ProductReview review = new ProductReview();
        review.setProductId(productId);
        review.setUserId(userId);
        review.setUserName(userName);
        review.setRating(rating);
        review.setComment(comment);

        return productReviewRepository.save(review);
    }

    public List<ProductReview> getReviewsByProductId(Long productId) {
        return productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public Double getAverageRating(Long productId) {
        List<ProductReview> reviews = productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double sum = reviews.stream().mapToInt(ProductReview::getRating).sum();
        return sum / reviews.size();
    }

    public Long getReviewCount(Long productId) {
        return (long) productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId).size();
    }
}
