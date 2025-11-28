package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.CustomOrder;
import com.example.smartweldbackend.repository.CustomOrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CustomOrderService {

    @Autowired
    private CustomOrderRepository customOrderRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public CustomOrder createCustomOrder(CustomOrder customOrder, Map<String, Object> measurements, Map<String, Object> aiDesign) throws JsonProcessingException {
        if (measurements != null) {
            customOrder.setMeasurementsJson(objectMapper.writeValueAsString(measurements));
        }
        if (aiDesign != null) {
            customOrder.setAiDesignJson(objectMapper.writeValueAsString(aiDesign));
        }
        return customOrderRepository.save(customOrder);
    }

    public List<CustomOrder> getAllCustomOrders() {
        return customOrderRepository.findAll();
    }

    public List<CustomOrder> getCustomOrdersByStatus(String status) {
        return customOrderRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public CustomOrder getCustomOrderById(Long id) {
        return customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found with id: " + id));
    }

    @Transactional
    public CustomOrder updateCustomOrderStatus(Long id, String status) {
        CustomOrder customOrder = getCustomOrderById(id);
        customOrder.setStatus(status);
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder approveCustomOrder(Long id) {
        return updateCustomOrderStatus(id, "APPROVED");
    }

    @Transactional
    public CustomOrder rejectCustomOrder(Long id) {
        return updateCustomOrderStatus(id, "REJECTED");
    }

    @Transactional
    public CustomOrder updateCustomOrder(CustomOrder customOrder, Map<String, Object> measurements, Map<String, Object> aiDesign) throws JsonProcessingException {
        if (measurements != null) {
            customOrder.setMeasurementsJson(objectMapper.writeValueAsString(measurements));
        }
        if (aiDesign != null) {
            customOrder.setAiDesignJson(objectMapper.writeValueAsString(aiDesign));
        }
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public void deleteCustomOrder(Long id) {
        CustomOrder customOrder = getCustomOrderById(id);
        customOrderRepository.delete(customOrder);
    }

    @Transactional
    public CustomOrder cancelCustomOrder(Long id) {
        return updateCustomOrderStatus(id, "CANCELLED");
    }

    @Transactional
    public CustomOrder updateOrderProgress(Long id, Integer progressPercentage) {
        CustomOrder customOrder = getCustomOrderById(id);
        
        // Validate progress percentage
        if (progressPercentage < 0) {
            progressPercentage = 0;
        } else if (progressPercentage > 100) {
            progressPercentage = 100;
        }
        
        customOrder.setProgressPercentage(progressPercentage);
        
        // Auto-update status based on progress
        if (progressPercentage == 0 && "APPROVED".equals(customOrder.getStatus())) {
            // Keep as APPROVED if progress is 0
        } else if (progressPercentage > 0 && progressPercentage < 100) {
            customOrder.setStatus("IN_PROGRESS");
        } else if (progressPercentage == 100) {
            customOrder.setStatus("READY_FOR_DELIVERY");
        }
        
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder startOrder(Long id) {
        CustomOrder customOrder = getCustomOrderById(id);
        if (!"APPROVED".equals(customOrder.getStatus())) {
            throw new RuntimeException("Only approved orders can be started");
        }
        customOrder.setStatus("IN_PROGRESS");
        customOrder.setProgressPercentage(0);
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder markAsReadyForDelivery(Long id) {
        CustomOrder customOrder = getCustomOrderById(id);
        customOrder.setStatus("READY_FOR_DELIVERY");
        customOrder.setProgressPercentage(100);
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder markAsCompleted(Long id) {
        CustomOrder customOrder = getCustomOrderById(id);
        if (!"READY_FOR_DELIVERY".equals(customOrder.getStatus())) {
            throw new RuntimeException("Only orders ready for delivery can be marked as completed");
        }
        customOrder.setStatus("COMPLETED");
        customOrder.setProgressPercentage(100);
        customOrder.setCompletionDate(LocalDateTime.now());
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder uploadCompletionPhotos(Long id, List<String> photoUrls) throws JsonProcessingException {
        CustomOrder customOrder = getCustomOrderById(id);
        // Allow uploading photos for orders that are ready (100% progress) or already marked as ready/completed
        boolean isReady = "READY_FOR_DELIVERY".equals(customOrder.getStatus()) || 
                         "COMPLETED".equals(customOrder.getStatus()) ||
                         ("IN_PROGRESS".equals(customOrder.getStatus()) && 
                          customOrder.getProgressPercentage() != null && 
                          customOrder.getProgressPercentage() >= 100);
        
        if (!isReady) {
            throw new RuntimeException("Can only upload completion photos for orders that are ready (100% progress) or already marked as ready/completed");
        }
        customOrder.setCompletionPhotosJson(objectMapper.writeValueAsString(photoUrls));
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder customerConfirm(Long id) {
        CustomOrder customOrder = getCustomOrderById(id);
        if (!"COMPLETED".equals(customOrder.getStatus()) && !"READY_FOR_DELIVERY".equals(customOrder.getStatus())) {
            throw new RuntimeException("Only completed or ready for delivery orders can be confirmed by customer");
        }
        customOrder.setCustomerConfirmation(true);
        customOrder.setIssueRaised(false);
        customOrder.setStatus("CONFIRMED_BY_CUSTOMER");
        customOrder.setConfirmedDate(LocalDateTime.now());
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder customerRaiseIssue(Long id, String issueDescription) {
        CustomOrder customOrder = getCustomOrderById(id);
        if (!"COMPLETED".equals(customOrder.getStatus()) && !"READY_FOR_DELIVERY".equals(customOrder.getStatus())) {
            throw new RuntimeException("Only completed or ready for delivery orders can have issues raised");
        }
        customOrder.setCustomerConfirmation(false);
        customOrder.setIssueRaised(true);
        customOrder.setIssueDescription(issueDescription);
        customOrder.setStatus("ISSUE_RAISED");
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder adminVerifyAndClose(Long id) {
        CustomOrder customOrder = getCustomOrderById(id);
        if (!"CONFIRMED_BY_CUSTOMER".equals(customOrder.getStatus())) {
            throw new RuntimeException("Only customer confirmed orders can be verified and closed by admin");
        }
        customOrder.setAdminVerified(true);
        customOrder.setStatus("CLOSED");
        customOrder.setClosedDate(LocalDateTime.now());
        
        // Generate invoice number if not exists
        if (customOrder.getInvoiceNumber() == null) {
            customOrder.setInvoiceNumber("INV-" + customOrder.getOrderNumber() + "-" + System.currentTimeMillis());
        }
        
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder addWelderNotes(Long id, String notes) {
        CustomOrder customOrder = getCustomOrderById(id);
        customOrder.setWelderNotes(notes);
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder addReviewAndRating(Long id, Integer rating, String reviewComment) {
        CustomOrder customOrder = getCustomOrderById(id);
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        customOrder.setRating(rating);
        customOrder.setReviewComment(reviewComment);
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder updatePaymentInfo(Long id, String paymentMethod, Double additionalCharges) {
        CustomOrder customOrder = getCustomOrderById(id);
        customOrder.setPaymentMethod(paymentMethod);
        if (additionalCharges != null) {
            customOrder.setAdditionalCharges(additionalCharges);
        }
        // Recalculate total amount
        if (customOrder.getEstimatedCost() != null) {
            customOrder.setTotalAmount(customOrder.getEstimatedCost() + (customOrder.getAdditionalCharges() != null ? customOrder.getAdditionalCharges() : 0.0));
        }
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder updatePaymentStatus(Long id, String paymentStatus) {
        CustomOrder customOrder = getCustomOrderById(id);
        customOrder.setPaymentStatus(paymentStatus);
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder resolveIssue(Long id, String resolutionNotes) {
        CustomOrder customOrder = getCustomOrderById(id);
        if (!"ISSUE_RAISED".equals(customOrder.getStatus())) {
            throw new RuntimeException("Only orders with raised issues can be resolved");
        }
        customOrder.setIssueRaised(false);
        customOrder.setStatus("IN_PROGRESS");
        if (resolutionNotes != null && !resolutionNotes.trim().isEmpty()) {
            String existingNotes = customOrder.getWelderNotes();
            String newNotes = "Issue Resolution: " + resolutionNotes;
            if (existingNotes != null && !existingNotes.trim().isEmpty()) {
                customOrder.setWelderNotes(existingNotes + "\n\n" + newNotes);
            } else {
                customOrder.setWelderNotes(newNotes);
            }
        }
        return customOrderRepository.save(customOrder);
    }

    @Transactional
    public CustomOrder assignWelders(Long id, List<Long> welderIds) throws JsonProcessingException {
        CustomOrder customOrder = getCustomOrderById(id);
        if (welderIds == null || welderIds.isEmpty()) {
            throw new RuntimeException("At least one welder must be assigned");
        }
        customOrder.setAssignedWeldersJson(objectMapper.writeValueAsString(welderIds));
        return customOrderRepository.save(customOrder);
    }

    public List<CustomOrder> getCustomOrdersByWelderId(Long welderId) {
        List<CustomOrder> allOrders = customOrderRepository.findAll();
        return allOrders.stream()
                .filter(order -> {
                    try {
                        // Only show orders that have assigned welders
                        if (order.getAssignedWeldersJson() == null || order.getAssignedWeldersJson().trim().isEmpty()) {
                            // Unassigned orders are not visible to any welder
                            // They must be assigned by admin first
                            return false;
                        }
                        // Parse assigned welders and check if this welder is assigned
                        List<Long> assignedWelders = objectMapper.readValue(
                                order.getAssignedWeldersJson(),
                                new TypeReference<List<Long>>() {}
                        );
                        // Only show if this welder is in the assigned list
                        return assignedWelders != null && assignedWelders.contains(welderId);
                    } catch (Exception e) {
                        // On error parsing, don't show the order (safety - prevents unauthorized access)
                        return false;
                    }
                })
                .collect(Collectors.toList());
    }
}

