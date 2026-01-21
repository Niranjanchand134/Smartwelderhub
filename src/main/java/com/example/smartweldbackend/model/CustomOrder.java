package com.example.smartweldbackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_orders")
public class CustomOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId; // ID of the user who placed the order

    private String customerName;
    private String mobileNumber;
    private String address;
    private String description;

    private String productType;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String measurementsJson;
    
    private String materialType;
    private String designType;
    private String designTemplate;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String referenceImageUrl;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String aiDesignJson;
    
    private Double estimatedCost;
    
    private String status; // PENDING, APPROVED, IN_PROGRESS, READY_FOR_DELIVERY, COMPLETED, CONFIRMED_BY_CUSTOMER, ISSUE_RAISED, CLOSED, REJECTED, CANCELLED
    
    private Integer progressPercentage; // 0-100
    
    private String orderNumber;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String completionPhotosJson; // JSON array of completion photo URLs
    
    private Boolean customerConfirmation; // true if customer confirmed, false if issue raised
    
    private Boolean issueRaised; // true if customer raised an issue
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String issueDescription; // Description of issue raised by customer
    
    private Boolean adminVerified; // true if admin verified and closed
    
    private String paymentStatus; // PENDING, PAID, PARTIAL, REFUNDED
    
    private String paymentMethod; // COD, ONLINE, INSTALLMENT
    
    private Double additionalCharges; // Additional charges for installment/on-site setup
    
    private Double totalAmount; // estimatedCost + additionalCharges
    
    private String invoiceNumber;
    
    private Integer rating; // 1-5 stars
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String reviewComment; // Customer review/feedback
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String welderNotes; // Notes from welder about the work
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String assignedWeldersJson; // JSON array of assigned welder IDs
    
    private LocalDateTime completionDate; // When welder marked as completed
    
    private LocalDateTime confirmedDate; // When customer confirmed
    
    private LocalDateTime closedDate; // When admin closed the order
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
        if (this.progressPercentage == null) {
            this.progressPercentage = 0;
        }
        if (this.orderNumber == null) {
            this.orderNumber = "CO" + System.currentTimeMillis();
        }
        if (this.customerConfirmation == null) {
            this.customerConfirmation = false;
        }
        if (this.issueRaised == null) {
            this.issueRaised = false;
        }
        if (this.adminVerified == null) {
            this.adminVerified = false;
        }
        if (this.paymentStatus == null) {
            this.paymentStatus = "PENDING";
        }
        if (this.additionalCharges == null) {
            this.additionalCharges = 0.0;
        }
        if (this.totalAmount == null && this.estimatedCost != null) {
            this.totalAmount = this.estimatedCost + (this.additionalCharges != null ? this.additionalCharges : 0.0);
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

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

    public String getMeasurementsJson() {
        return measurementsJson;
    }

    public void setMeasurementsJson(String measurementsJson) {
        this.measurementsJson = measurementsJson;
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

    public String getAiDesignJson() {
        return aiDesignJson;
    }

    public void setAiDesignJson(String aiDesignJson) {
        this.aiDesignJson = aiDesignJson;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getCompletionPhotosJson() {
        return completionPhotosJson;
    }

    public void setCompletionPhotosJson(String completionPhotosJson) {
        this.completionPhotosJson = completionPhotosJson;
    }

    public Boolean getCustomerConfirmation() {
        return customerConfirmation;
    }

    public void setCustomerConfirmation(Boolean customerConfirmation) {
        this.customerConfirmation = customerConfirmation;
    }

    public Boolean getIssueRaised() {
        return issueRaised;
    }

    public void setIssueRaised(Boolean issueRaised) {
        this.issueRaised = issueRaised;
    }

    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }

    public Boolean getAdminVerified() {
        return adminVerified;
    }

    public void setAdminVerified(Boolean adminVerified) {
        this.adminVerified = adminVerified;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

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
        // Update total amount when additional charges change
        if (this.estimatedCost != null) {
            this.totalAmount = this.estimatedCost + (additionalCharges != null ? additionalCharges : 0.0);
        }
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

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

    public String getWelderNotes() {
        return welderNotes;
    }

    public void setWelderNotes(String welderNotes) {
        this.welderNotes = welderNotes;
    }

    public String getAssignedWeldersJson() {
        return assignedWeldersJson;
    }

    public void setAssignedWeldersJson(String assignedWeldersJson) {
        this.assignedWeldersJson = assignedWeldersJson;
    }

    public LocalDateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }

    public LocalDateTime getConfirmedDate() {
        return confirmedDate;
    }

    public void setConfirmedDate(LocalDateTime confirmedDate) {
        this.confirmedDate = confirmedDate;
    }

    public LocalDateTime getClosedDate() {
        return closedDate;
    }

    public void setClosedDate(LocalDateTime closedDate) {
        this.closedDate = closedDate;
    }
}

