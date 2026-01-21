package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.CustomOrder;
import com.example.smartweldbackend.model.MaterialRequest;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.CustomOrderRepository;
import com.example.smartweldbackend.repository.UserRepository;
import com.example.smartweldbackend.repository.ProductRepository;
import com.example.smartweldbackend.repository.OrderRepository;
import com.example.smartweldbackend.repository.MaterialRequestRepository;
import com.example.smartweldbackend.service.MaterialRequestService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CustomOrderService {

    @Autowired
    private CustomOrderRepository customOrderRepository;

    @Autowired
    private MaterialRequestService materialRequestService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MaterialRequestRepository materialRequestRepository;

    @Autowired
    private NotificationService notificationService;

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
        
        // Store old progress before updating
        Integer oldProgress = customOrder.getProgressPercentage() != null ? customOrder.getProgressPercentage() : 0;
        
        // Validate progress percentage
        if (progressPercentage < 0) {
            progressPercentage = 0;
        } else if (progressPercentage > 100) {
            progressPercentage = 100;
        }
        
        // Calculate change amount
        int changeAmount = Math.abs(progressPercentage - oldProgress);
        
        customOrder.setProgressPercentage(progressPercentage);
        
        // Auto-update status based on progress
        if (progressPercentage == 0 && "APPROVED".equals(customOrder.getStatus())) {
            // Keep as APPROVED if progress is 0
        } else if (progressPercentage > 0 && progressPercentage < 100) {
            customOrder.setStatus("IN_PROGRESS");
        } else if (progressPercentage == 100) {
            customOrder.setStatus("READY_FOR_DELIVERY");
        }
        
        CustomOrder savedOrder = customOrderRepository.save(customOrder);
        
        // Send notification to customer if progress changed by 5% or 10%
        if (changeAmount > 0 && customOrder.getCustomerId() != null) {
            // Only notify if change is exactly 5% or 10%
            if (changeAmount == 5 || changeAmount == 10) {
                String orderNumber = customOrder.getOrderNumber() != null ? 
                    customOrder.getOrderNumber() : 
                    "#" + customOrder.getId().toString();
                notificationService.notifyCustomerAboutProgressUpdate(
                    customOrder.getCustomerId(),
                    orderNumber,
                    oldProgress,
                    progressPercentage
                );
            }
        }
        
        return savedOrder;
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

    public Map<String, Object> getWelderDashboardStats(Long welderId) {
        List<CustomOrder> welderOrders = getCustomOrdersByWelderId(welderId);
        
        // Count orders by status
        long newOrdersCount = welderOrders.stream()
                .filter(o -> "APPROVED".equals(o.getStatus()) || "PENDING".equals(o.getStatus()))
                .count();
        
        long inProgressCount = welderOrders.stream()
                .filter(o -> "IN_PROGRESS".equals(o.getStatus()))
                .count();
        
        long readyForDeliveryCount = welderOrders.stream()
                .filter(o -> "READY_FOR_DELIVERY".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus()))
                .count();
        
        // Get recent orders (last 5)
        List<Map<String, Object>> newOrders = welderOrders.stream()
                .filter(o -> "APPROVED".equals(o.getStatus()) || "PENDING".equals(o.getStatus()))
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .limit(5)
                .map(order -> {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("id", order.getId());
                    orderMap.put("orderNumber", order.getOrderNumber());
                    orderMap.put("customer", order.getCustomerName());
                    orderMap.put("product", order.getProductType());
                    orderMap.put("createdAt", order.getCreatedAt());
                    orderMap.put("status", order.getStatus());
                    return orderMap;
                })
                .collect(Collectors.toList());
        
        List<Map<String, Object>> inProgressOrders = welderOrders.stream()
                .filter(o -> "IN_PROGRESS".equals(o.getStatus()))
                .sorted((a, b) -> {
                    if (a.getUpdatedAt() == null) return 1;
                    if (b.getUpdatedAt() == null) return -1;
                    return b.getUpdatedAt().compareTo(a.getUpdatedAt());
                })
                .limit(5)
                .map(order -> {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("id", order.getId());
                    orderMap.put("orderNumber", order.getOrderNumber());
                    orderMap.put("customer", order.getCustomerName());
                    orderMap.put("product", order.getProductType());
                    orderMap.put("progress", order.getProgressPercentage() != null ? order.getProgressPercentage() : 0);
                    orderMap.put("status", order.getStatus());
                    return orderMap;
                })
                .collect(Collectors.toList());
        
        List<Map<String, Object>> readyOrders = welderOrders.stream()
                .filter(o -> "READY_FOR_DELIVERY".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus()))
                .sorted((a, b) -> {
                    if (a.getUpdatedAt() == null) return 1;
                    if (b.getUpdatedAt() == null) return -1;
                    return b.getUpdatedAt().compareTo(a.getUpdatedAt());
                })
                .limit(5)
                .map(order -> {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("id", order.getId());
                    orderMap.put("orderNumber", order.getOrderNumber());
                    orderMap.put("customer", order.getCustomerName());
                    orderMap.put("product", order.getProductType());
                    orderMap.put("status", order.getStatus());
                    return orderMap;
                })
                .collect(Collectors.toList());
        
        // Get material requirements for the welder
        List<MaterialRequest> materialRequests = materialRequestService.getMaterialRequestsByWelderId(welderId);
        
        // Group material requests by material name and aggregate quantities
        Map<String, Map<String, Object>> materialMap = new HashMap<>();
        
        for (MaterialRequest request : materialRequests) {
            String materialName = request.getMaterialName();
            
            if (!materialMap.containsKey(materialName)) {
                Map<String, Object> materialData = new HashMap<>();
                materialData.put("material", materialName);
                materialData.put("quantity", 0.0);
                materialData.put("unit", request.getUnit() != null ? request.getUnit() : "");
                materialData.put("jobs", 0);
                materialData.put("requests", new ArrayList<MaterialRequest>());
                materialMap.put(materialName, materialData);
            }
            
            Map<String, Object> materialData = materialMap.get(materialName);
            Double currentQuantity = (Double) materialData.get("quantity");
            materialData.put("quantity", currentQuantity + request.getQuantity());
            
            Integer currentJobs = (Integer) materialData.get("jobs");
            materialData.put("jobs", currentJobs + 1);
            
            @SuppressWarnings("unchecked")
            List<MaterialRequest> requests = (List<MaterialRequest>) materialData.get("requests");
            requests.add(request);
        }
        
        // Convert to list and format for display with status determination
        List<Map<String, Object>> materialRequirements = materialMap.values().stream()
                .map(material -> {
                    @SuppressWarnings("unchecked")
                    List<MaterialRequest> requests = (List<MaterialRequest>) material.get("requests");
                    String status = determineMaterialStatus(requests);
                    
                    Map<String, Object> formatted = new HashMap<>();
                    formatted.put("material", material.get("material"));
                    Double quantity = (Double) material.get("quantity");
                    String unit = (String) material.get("unit");
                    formatted.put("quantity", String.format("%.0f %s", quantity, unit != null ? unit : ""));
                    Integer jobs = (Integer) material.get("jobs");
                    formatted.put("jobs", jobs + (jobs == 1 ? " order" : " orders"));
                    formatted.put("status", status);
                    return formatted;
                })
                .limit(10) // Limit to top 10 materials
                .collect(Collectors.toList());
        
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("stats", Map.of(
                "newOrders", newOrdersCount,
                "inProgress", inProgressCount,
                "readyForDelivery", readyForDeliveryCount
        ));
        dashboardData.put("newOrders", newOrders);
        dashboardData.put("inProgressOrders", inProgressOrders);
        dashboardData.put("readyOrders", readyOrders);
        dashboardData.put("materialRequirements", materialRequirements);
        
        return dashboardData;
    }
    
    private String determineMaterialStatus(List<MaterialRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return "Order Needed";
        }
        
        // Check if any are fulfilled
        boolean hasFulfilled = requests.stream()
                .anyMatch(r -> "FULFILLED".equals(r.getStatus()));
        
        // Check if any are approved
        boolean hasApproved = requests.stream()
                .anyMatch(r -> "APPROVED".equals(r.getStatus()));
        
        // Check if any are pending
        boolean hasPending = requests.stream()
                .anyMatch(r -> "PENDING".equals(r.getStatus()));
        
        if (hasFulfilled) {
            return "In Stock";
        } else if (hasApproved) {
            return "Approved";
        } else if (hasPending) {
            return "Pending";
        } else {
            return "Order Needed";
        }
    }

    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> dashboardData = new HashMap<>();
        
        // Get all counts
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long totalCustomOrders = customOrderRepository.count();
        long totalMaterialRequests = materialRequestRepository.count();
        
        // Get user counts
        List<user> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long totalCustomers = allUsers.stream().filter(u -> "USER".equals(u.getRole())).count();
        long totalWelders = allUsers.stream().filter(u -> "WELDER".equals(u.getRole())).count();
        long activeWelders = allUsers.stream()
                .filter(u -> "WELDER".equals(u.getRole()) && 
                        ("ACTIVE".equals(u.getStatus()) || "VERIFIED".equals(u.getStatus())))
                .count();
        
        // Get custom order counts by status
        List<CustomOrder> allCustomOrders = customOrderRepository.findAll();
        long pendingCustomOrders = allCustomOrders.stream()
                .filter(o -> "PENDING".equals(o.getStatus()))
                .count();
        long inProgressCustomOrders = allCustomOrders.stream()
                .filter(o -> "IN_PROGRESS".equals(o.getStatus()))
                .count();
        long completedCustomOrders = allCustomOrders.stream()
                .filter(o -> "COMPLETED".equals(o.getStatus()) || 
                            "READY_FOR_DELIVERY".equals(o.getStatus()) ||
                            "CONFIRMED_BY_CUSTOMER".equals(o.getStatus()) ||
                            "CLOSED".equals(o.getStatus()))
                .count();
        
        // Get material request counts by status
        List<MaterialRequest> allMaterialRequests = materialRequestRepository.findAll();
        long pendingMaterialRequests = allMaterialRequests.stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .count();
        long approvedMaterialRequests = allMaterialRequests.stream()
                .filter(r -> "APPROVED".equals(r.getStatus()))
                .count();
        
        // Get recent custom orders (limit to 5 most recent, or all if less than 5 exist)
        List<Map<String, Object>> recentCustomOrders = allCustomOrders.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .limit(5) // Show up to 5 most recent orders
                .map(order -> {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("id", order.getId());
                    orderMap.put("orderNumber", order.getOrderNumber());
                    orderMap.put("customer", order.getCustomerName());
                    orderMap.put("product", order.getProductType());
                    orderMap.put("status", order.getStatus());
                    orderMap.put("createdAt", order.getCreatedAt());
                    return orderMap;
                })
                .collect(Collectors.toList());
        
        // Get recent material requests (last 5)
        List<Map<String, Object>> recentMaterialRequests = allMaterialRequests.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .limit(5)
                .map(request -> {
                    Map<String, Object> requestMap = new HashMap<>();
                    requestMap.put("id", request.getId());
                    requestMap.put("requestNumber", request.getRequestNumber());
                    requestMap.put("materialName", request.getMaterialName());
                    requestMap.put("quantity", request.getQuantity());
                    requestMap.put("unit", request.getUnit());
                    requestMap.put("status", request.getStatus());
                    requestMap.put("priority", request.getPriority());
                    requestMap.put("createdAt", request.getCreatedAt());
                    // Get welder name
                    user welder = userRepository.findById(request.getWelderId()).orElse(null);
                    requestMap.put("welderName", welder != null ? welder.getFullName() : "Unknown");
                    return requestMap;
                })
                .collect(Collectors.toList());
        
        // Build stats map
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalCustomOrders", totalCustomOrders);
        stats.put("totalMaterialRequests", totalMaterialRequests);
        stats.put("totalUsers", totalUsers);
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalWelders", totalWelders);
        stats.put("activeWelders", activeWelders);
        stats.put("pendingCustomOrders", pendingCustomOrders);
        stats.put("inProgressCustomOrders", inProgressCustomOrders);
        stats.put("completedCustomOrders", completedCustomOrders);
        stats.put("pendingMaterialRequests", pendingMaterialRequests);
        stats.put("approvedMaterialRequests", approvedMaterialRequests);
        
        dashboardData.put("stats", stats);
        dashboardData.put("recentCustomOrders", recentCustomOrders);
        dashboardData.put("recentMaterialRequests", recentMaterialRequests);
        
        return dashboardData;
    }
}

