package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.CustomOrder;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.UserRepository;
import com.example.smartweldbackend.service.CustomOrderService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/custom-orders")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomOrderController {

    @Autowired
    private CustomOrderService customOrderService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createCustomOrder(@RequestBody CustomOrderRequest request) {
        try {
            CustomOrder customOrder = new CustomOrder();
            customOrder.setCustomerName(request.getCustomerName());
            customOrder.setMobileNumber(request.getMobileNumber());
            customOrder.setAddress(request.getAddress());
            customOrder.setDescription(request.getDescription());
            customOrder.setProductType(request.getProductType());
            customOrder.setMaterialType(request.getMaterialType());
            customOrder.setDesignType(request.getDesignType());
            customOrder.setDesignTemplate(request.getDesignTemplate());
            customOrder.setReferenceImageUrl(request.getReferenceImageUrl());
            customOrder.setEstimatedCost(request.getEstimatedCost());

            CustomOrder saved = customOrderService.createCustomOrder(
                customOrder,
                request.getMeasurements(),
                request.getAiDesign()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to process order data: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create custom order: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<CustomOrder>> getAllCustomOrders() {
        return ResponseEntity.ok(customOrderService.getAllCustomOrders());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CustomOrder>> getCustomOrdersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(customOrderService.getCustomOrdersByStatus(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomOrderById(@PathVariable Long id) {
        try {
            CustomOrder customOrder = customOrderService.getCustomOrderById(id);
            return ResponseEntity.ok(customOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveCustomOrder(@PathVariable Long id) {
        try {
            CustomOrder approved = customOrderService.approveCustomOrder(id);
            return ResponseEntity.ok(approved);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to approve order: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectCustomOrder(@PathVariable Long id) {
        try {
            CustomOrder rejected = customOrderService.rejectCustomOrder(id);
            return ResponseEntity.ok(rejected);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to reject order: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomOrder(@PathVariable Long id, @RequestBody CustomOrderRequest request) {
        try {
            CustomOrder existingOrder = customOrderService.getCustomOrderById(id);
            
            // Only allow updates if order is PENDING
            if (!"PENDING".equals(existingOrder.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Only pending orders can be updated");
            }

            existingOrder.setCustomerName(request.getCustomerName());
            existingOrder.setMobileNumber(request.getMobileNumber());
            existingOrder.setAddress(request.getAddress());
            existingOrder.setDescription(request.getDescription());
            existingOrder.setProductType(request.getProductType());
            existingOrder.setMaterialType(request.getMaterialType());
            existingOrder.setDesignType(request.getDesignType());
            existingOrder.setDesignTemplate(request.getDesignTemplate());
            existingOrder.setReferenceImageUrl(request.getReferenceImageUrl());
            existingOrder.setEstimatedCost(request.getEstimatedCost());

            CustomOrder updated = customOrderService.updateCustomOrder(
                existingOrder,
                request.getMeasurements(),
                request.getAiDesign()
            );

            return ResponseEntity.ok(updated);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to process order data: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update custom order: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomOrder(@PathVariable Long id) {
        try {
            CustomOrder existingOrder = customOrderService.getCustomOrderById(id);
            
            // Only allow deletion if order is PENDING
            if (!"PENDING".equals(existingOrder.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Only pending orders can be deleted");
            }

            customOrderService.deleteCustomOrder(id);
            return ResponseEntity.ok().body("Order deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete order: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelCustomOrder(@PathVariable Long id) {
        try {
            CustomOrder cancelled = customOrderService.cancelCustomOrder(id);
            return ResponseEntity.ok(cancelled);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to cancel order: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<?> updateOrderProgress(@PathVariable Long id, @RequestBody ProgressUpdateRequest request) {
        try {
            CustomOrder updated = customOrderService.updateOrderProgress(id, request.getProgressPercentage());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update progress: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<?> startOrder(@PathVariable Long id) {
        try {
            CustomOrder started = customOrderService.startOrder(id);
            return ResponseEntity.ok(started);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to start order: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/ready")
    public ResponseEntity<?> markAsReadyForDelivery(@PathVariable Long id) {
        try {
            CustomOrder ready = customOrderService.markAsReadyForDelivery(id);
            return ResponseEntity.ok(ready);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to mark as ready: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> markAsCompleted(@PathVariable Long id) {
        try {
            CustomOrder completed = customOrderService.markAsCompleted(id);
            return ResponseEntity.ok(completed);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to mark as completed: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/completion-photos")
    public ResponseEntity<?> uploadCompletionPhotos(@PathVariable Long id, @RequestBody List<String> photoUrls) {
        try {
            if (photoUrls == null || photoUrls.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Photo URLs list cannot be empty");
            }
            CustomOrder updated = customOrderService.uploadCompletionPhotos(id, photoUrls);
            return ResponseEntity.ok(updated);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to process photos: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload photos: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/customer-confirm")
    public ResponseEntity<?> customerConfirm(@PathVariable Long id) {
        try {
            CustomOrder confirmed = customOrderService.customerConfirm(id);
            return ResponseEntity.ok(confirmed);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to confirm order: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/raise-issue")
    public ResponseEntity<?> customerRaiseIssue(@PathVariable Long id, @RequestBody IssueRequest request) {
        try {
            CustomOrder updated = customOrderService.customerRaiseIssue(id, request.getIssueDescription());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to raise issue: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/admin-verify")
    public ResponseEntity<?> adminVerifyAndClose(@PathVariable Long id) {
        try {
            CustomOrder closed = customOrderService.adminVerifyAndClose(id);
            return ResponseEntity.ok(closed);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to verify and close: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/welder-notes")
    public ResponseEntity<?> addWelderNotes(@PathVariable Long id, @RequestBody NotesRequest request) {
        try {
            CustomOrder updated = customOrderService.addWelderNotes(id, request.getNotes());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add notes: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<?> addReviewAndRating(@PathVariable Long id, @RequestBody ReviewRequest request) {
        try {
            CustomOrder updated = customOrderService.addReviewAndRating(id, request.getRating(), request.getReviewComment());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add review: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/payment-info")
    public ResponseEntity<?> updatePaymentInfo(@PathVariable Long id, @RequestBody PaymentInfoRequest request) {
        try {
            CustomOrder updated = customOrderService.updatePaymentInfo(id, request.getPaymentMethod(), request.getAdditionalCharges());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update payment info: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, @RequestBody PaymentStatusRequest request) {
        try {
            CustomOrder updated = customOrderService.updatePaymentStatus(id, request.getPaymentStatus());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update payment status: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/resolve-issue")
    public ResponseEntity<?> resolveIssue(@PathVariable Long id, @RequestBody IssueResolutionRequest request) {
        try {
            CustomOrder resolved = customOrderService.resolveIssue(id, request.getResolutionNotes());
            return ResponseEntity.ok(resolved);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to resolve issue: " + e.getMessage());
        }
    }

    @GetMapping("/welders")
    public ResponseEntity<?> getAllWelders() {
        try {
            List<user> welders = userRepository.findByRole("WELDER");
            // Filter only active welders and return simplified data
            List<Map<String, Object>> welderList = welders.stream()
                    .filter(w -> "ACTIVE".equals(w.getStatus()) || "VERIFIED".equals(w.getStatus()))
                    .map(w -> {
                        Map<String, Object> welderData = new HashMap<>();
                        welderData.put("id", w.getId());
                        welderData.put("fullName", w.getFullName());
                        welderData.put("email", w.getEmail());
                        welderData.put("phoneNumber", w.getPhoneNumber());
                        welderData.put("status", w.getStatus());
                        welderData.put("skills", w.getSkills());
                        welderData.put("experience", w.getExperience());
                        welderData.put("profileImage", w.getProfileImage());
                        return welderData;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(welderList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch welders: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/assign-welders")
    public ResponseEntity<?> assignWelders(@PathVariable Long id, @RequestBody WelderAssignmentRequest request) {
        try {
            if (request.getWelderIds() == null || request.getWelderIds().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("At least one welder must be assigned");
            }
            CustomOrder updated = customOrderService.assignWelders(id, request.getWelderIds());
            return ResponseEntity.ok(updated);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to process welder assignment: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to assign welders: " + e.getMessage());
        }
    }

    @GetMapping("/welder/{welderId}")
    public ResponseEntity<?> getOrdersByWelder(@PathVariable Long welderId) {
        try {
            List<CustomOrder> orders = customOrderService.getCustomOrdersByWelderId(welderId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch orders: " + e.getMessage());
        }
    }

    public static class ProgressUpdateRequest {
        private Integer progressPercentage;

        public Integer getProgressPercentage() {
            return progressPercentage;
        }

        public void setProgressPercentage(Integer progressPercentage) {
            this.progressPercentage = progressPercentage;
        }
    }

    public static class IssueRequest {
        private String issueDescription;

        public String getIssueDescription() {
            return issueDescription;
        }

        public void setIssueDescription(String issueDescription) {
            this.issueDescription = issueDescription;
        }
    }

    public static class NotesRequest {
        private String notes;

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class ReviewRequest {
        private Integer rating;
        private String reviewComment;

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }

        public String getReviewComment() {
            return reviewComment;
        }

        public void setReviewComment(String reviewComment) {
            this.reviewComment = reviewComment;
        }
    }

    public static class PaymentInfoRequest {
        private String paymentMethod;
        private Double additionalCharges;

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public Double getAdditionalCharges() {
            return additionalCharges;
        }

        public void setAdditionalCharges(Double additionalCharges) {
            this.additionalCharges = additionalCharges;
        }
    }

    public static class PaymentStatusRequest {
        private String paymentStatus;

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }
    }

    public static class IssueResolutionRequest {
        private String resolutionNotes;

        public String getResolutionNotes() {
            return resolutionNotes;
        }

        public void setResolutionNotes(String resolutionNotes) {
            this.resolutionNotes = resolutionNotes;
        }
    }

    public static class WelderAssignmentRequest {
        private List<Long> welderIds;

        public List<Long> getWelderIds() {
            return welderIds;
        }

        public void setWelderIds(List<Long> welderIds) {
            this.welderIds = welderIds;
        }
    }

    public static class CustomOrderRequest {
        private String customerName;
        private String mobileNumber;
        private String address;
        private String description;
        private String productType;
        private Map<String, Object> measurements;
        private String materialType;
        private String designType;
        private String designTemplate;
        private String referenceImageUrl;
        private Map<String, Object> aiDesign;
        private Double estimatedCost;

        // Getters and Setters
        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public String getMobileNumber() {
            return mobileNumber;
        }

        public void setMobileNumber(String mobileNumber) {
            this.mobileNumber = mobileNumber;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getProductType() {
            return productType;
        }

        public void setProductType(String productType) {
            this.productType = productType;
        }

        public Map<String, Object> getMeasurements() {
            return measurements;
        }

        public void setMeasurements(Map<String, Object> measurements) {
            this.measurements = measurements;
        }

        public String getMaterialType() {
            return materialType;
        }

        public void setMaterialType(String materialType) {
            this.materialType = materialType;
        }

        public String getDesignType() {
            return designType;
        }

        public void setDesignType(String designType) {
            this.designType = designType;
        }

        public String getDesignTemplate() {
            return designTemplate;
        }

        public void setDesignTemplate(String designTemplate) {
            this.designTemplate = designTemplate;
        }

        public String getReferenceImageUrl() {
            return referenceImageUrl;
        }

        public void setReferenceImageUrl(String referenceImageUrl) {
            this.referenceImageUrl = referenceImageUrl;
        }

        public Map<String, Object> getAiDesign() {
            return aiDesign;
        }

        public void setAiDesign(Map<String, Object> aiDesign) {
            this.aiDesign = aiDesign;
        }

        public Double getEstimatedCost() {
            return estimatedCost;
        }

        public void setEstimatedCost(Double estimatedCost) {
            this.estimatedCost = estimatedCost;
        }
    }
}

