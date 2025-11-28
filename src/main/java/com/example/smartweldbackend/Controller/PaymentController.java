package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.CustomOrder;
import com.example.smartweldbackend.model.Order;
import com.example.smartweldbackend.repository.CustomOrderRepository;
import com.example.smartweldbackend.repository.OrderRepository;
import com.example.smartweldbackend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomOrderRepository customOrderRepository;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/esewa/initiate")
    public ResponseEntity<?> initiateEsewaPayment(@RequestBody Map<String, Object> orderData) {
        try {
            Double totalAmount = Double.valueOf(orderData.get("totalAmount").toString());
            
            // Calculate tax (13% VAT in Nepal)
            Double taxAmount = totalAmount * 0.13;
            Double serviceCharge = 0.0;
            Double deliveryCharge = 0.0;
            
            // Generate unique transaction UUID
            String transactionUuid = UUID.randomUUID().toString();
            
            // eSewa payment request data
            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("amount", totalAmount - taxAmount);
            paymentRequest.put("tax_amount", taxAmount);
            paymentRequest.put("total_amount", totalAmount);
            paymentRequest.put("transaction_uuid", transactionUuid);
            paymentRequest.put("product_code", "EPAYTEST");
            paymentRequest.put("product_service_charge", serviceCharge);
            paymentRequest.put("product_delivery_charge", deliveryCharge);
            paymentRequest.put("success_url", "http://localhost:5173/payment/success?q=su");
            paymentRequest.put("failure_url", "http://localhost:5173/payment/failure?q=fu");
            paymentRequest.put("signed_field_names", "total_amount,transaction_uuid,product_code");
            
            // Generate signature (simplified - in production, use proper HMAC SHA256)
            String signature = generateSignature(paymentRequest);
            paymentRequest.put("signature", signature);
            
            return ResponseEntity.ok(paymentRequest);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to initiate payment: " + e.getMessage());
        }
    }

    @PostMapping("/esewa/verify")
    @Transactional
    public ResponseEntity<?> verifyEsewaPayment(@RequestBody Map<String, Object> paymentData) {
        try {
            Long orderId = Long.valueOf(paymentData.get("orderId").toString());
            
            // Try to find as regular order first
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            
            if (orderOpt.isPresent()) {
                // Handle regular order
                Order order = orderOpt.get();
                order.setPaymentStatus("COMPLETED");
                Order updatedOrder = orderRepository.save(order);
                
                // Notify admin about payment confirmation
                notificationService.notifyAdminAboutPaymentConfirmation(
                    order.getCustomerName(),
                    order.getTotalAmount(),
                    order.getId(),
                    "eSewa"
                );
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Payment verified successfully");
                response.put("order", updatedOrder);
                response.put("orderType", "regular");
                
                return ResponseEntity.ok(response);
            } else {
                // Try to find as custom order
                Optional<CustomOrder> customOrderOpt = customOrderRepository.findById(orderId);
                
                if (customOrderOpt.isPresent()) {
                    // Handle custom order
                    CustomOrder customOrder = customOrderOpt.get();
                    customOrder.setPaymentStatus("PAID");
                    CustomOrder updatedCustomOrder = customOrderRepository.save(customOrder);
                    
                    // Notify admin about payment confirmation
                    notificationService.notifyAdminAboutPaymentConfirmation(
                        customOrder.getCustomerName(),
                        customOrder.getTotalAmount() != null ? customOrder.getTotalAmount() : customOrder.getEstimatedCost(),
                        customOrder.getId(),
                        "eSewa"
                    );
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Payment verified successfully");
                    response.put("order", updatedCustomOrder);
                    response.put("orderType", "custom");
                    
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
                }
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to verify payment: " + e.getMessage());
        }
    }

    private String generateSignature(Map<String, Object> paymentRequest) {
        // Simplified signature generation
        // In production, use proper HMAC SHA256 with secret key
        String secretKey = "8gBm/:&EnhH.1/q";
        String data = paymentRequest.get("total_amount") + "," +
                     paymentRequest.get("transaction_uuid") + "," +
                     paymentRequest.get("product_code");
        
        // For now, return a simple hash (in production, use proper HMAC)
        return data.hashCode() + "";
    }
}

