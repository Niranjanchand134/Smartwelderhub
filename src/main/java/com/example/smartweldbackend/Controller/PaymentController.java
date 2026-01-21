package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.CustomOrder;
import com.example.smartweldbackend.model.Order;
import com.example.smartweldbackend.repository.CustomOrderRepository;
import com.example.smartweldbackend.repository.OrderRepository;
import com.example.smartweldbackend.service.NotificationService;
import com.example.smartweldbackend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.client.RestTemplate;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
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
    
    @Autowired
    private ProductService productService;
    
    // eSewa Configuration - Currently set for TESTING/UAT environment
    @Value("${esewa.secret.key:8gBm/:&EnhH.1/q}") // UAT secret key
    private String esewaSecretKey;
    
    @Value("${esewa.product.code:EPAYTEST}") // Test product code
    private String esewaProductCode;
    
    @Value("${esewa.test.url:https://rc-epay.esewa.com.np/api/epay/main/v2/form}")
    private String esewaTestUrl;
    
    @Value("${esewa.status.test.url:https://rc.esewa.com.np/api/epay/transaction/status/}")
    private String esewaStatusTestUrl;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/esewa/initiate")
    public ResponseEntity<?> initiateEsewaPayment(@RequestBody Map<String, Object> orderData) {
        try {
            Double totalAmount = Double.valueOf(orderData.get("totalAmount").toString());
            Long orderId = orderData.get("orderId") != null ? Long.valueOf(orderData.get("orderId").toString()) : null;
            
            // For eSewa UAT/Testing: Use totalAmount as base, set tax to 0
            // This is the standard approach for eSewa test environment
            Double baseAmount = totalAmount;
            Double taxAmount = 0.0; // No tax for testing/UAT
            Double serviceCharge = 0.0;
            Double deliveryCharge = 0.0;
            
            // Generate unique transaction UUID - include orderId if available for tracking
            String transactionUuid = orderId != null ? 
                "ORDER-" + orderId + "-" + UUID.randomUUID().toString().substring(0, 8) :
                UUID.randomUUID().toString();
            
            // eSewa payment request data
            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("amount", String.format("%.2f", baseAmount));
            paymentRequest.put("tax_amount", String.format("%.2f", taxAmount));
            paymentRequest.put("total_amount", String.format("%.2f", totalAmount));
            paymentRequest.put("transaction_uuid", transactionUuid);
            paymentRequest.put("product_code", esewaProductCode);
            paymentRequest.put("product_service_charge", String.format("%.2f", serviceCharge));
            paymentRequest.put("product_delivery_charge", String.format("%.2f", deliveryCharge));
            paymentRequest.put("success_url", "http://localhost:5173/payment/success");
            paymentRequest.put("failure_url", "http://localhost:5173/payment/failure");
            paymentRequest.put("signed_field_names", "total_amount,transaction_uuid,product_code");
            
            // Generate signature using HMAC SHA256
            String signature = generateSignature(paymentRequest);
            paymentRequest.put("signature", signature);
            
            // Store orderId in response for frontend reference
            if (orderId != null) {
                paymentRequest.put("orderId", orderId);
            }
            
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
            // Handle Base64 encoded response from eSewa
            String encodedData = paymentData.get("data") != null ? paymentData.get("data").toString() : null;
            Map<String, Object> esewaResponse = paymentData;
            
            if (encodedData != null && !encodedData.isEmpty()) {
                // Decode Base64 response
                try {
                    String decodedData = new String(Base64.getDecoder().decode(encodedData), StandardCharsets.UTF_8);
                    // Parse JSON response (simplified - in production use proper JSON parser)
                    esewaResponse = parseEsewaResponse(decodedData);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid payment response format: " + e.getMessage());
                }
            }
            
            // Verify signature
            if (!verifySignature(esewaResponse)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid payment signature");
            }
            
            // Extract transaction details
            String transactionUuid = esewaResponse.get("transaction_uuid") != null ? 
                esewaResponse.get("transaction_uuid").toString() : null;
            String status = esewaResponse.get("status") != null ? 
                esewaResponse.get("status").toString() : null;
            String transactionCode = esewaResponse.get("transaction_code") != null ? 
                esewaResponse.get("transaction_code").toString() : null;
            
            // Extract orderId from transaction_uuid (format: ORDER-{orderId}-{uuid})
            Long orderId = null;
            if (transactionUuid != null && transactionUuid.startsWith("ORDER-")) {
                try {
                    String[] parts = transactionUuid.split("-");
                    if (parts.length >= 2) {
                        orderId = Long.parseLong(parts[1]);
                    }
                } catch (NumberFormatException e) {
                    // If orderId not in UUID, try to get from paymentData
                    if (paymentData.get("orderId") != null) {
                        orderId = Long.valueOf(paymentData.get("orderId").toString());
                    }
                }
            } else if (paymentData.get("orderId") != null) {
                orderId = Long.valueOf(paymentData.get("orderId").toString());
            }
            
            if (orderId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Order ID not found in payment response");
            }
            
            // Check if payment is complete
            if (!"COMPLETE".equals(status)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Payment status: " + status);
                response.put("status", status);
                return ResponseEntity.ok(response);
            }
            
            // Try to find as regular order first
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            
            if (orderOpt.isPresent()) {
                // Handle regular order
                Order order = orderOpt.get();
                order.setPaymentStatus("COMPLETED");
                Order updatedOrder = orderRepository.save(order);
                
                // Deduct stock for each item in the order after successful payment
                try {
                    String itemsJson = order.getItemsJson();
                    if (itemsJson != null && !itemsJson.isEmpty()) {
                        List<?> itemsList = objectMapper.readValue(itemsJson, List.class);
                        for (Object item : itemsList) {
                            if (item instanceof Map) {
                                Map<String, Object> itemMap = (Map<String, Object>) item;
                                Long productId = Long.valueOf(itemMap.get("productId").toString());
                                Integer quantity = Integer.valueOf(itemMap.get("quantity").toString());
                                
                                // Deduct stock after successful payment
                                productService.deductStock(productId, quantity);
                            }
                        }
                    }
                } catch (Exception e) {
                    // Log error but don't fail payment verification
                    System.err.println("Error deducting stock after payment: " + e.getMessage());
                    // Payment is already verified, so we continue
                }
                
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
                response.put("transactionCode", transactionCode);
                
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
                    response.put("transactionCode", transactionCode);
                    
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
    
    @GetMapping("/esewa/status")
    public ResponseEntity<?> checkEsewaPaymentStatus(
            @RequestParam String productCode,
            @RequestParam String transactionUuid,
            @RequestParam Double totalAmount) {
        try {
            // Call eSewa status check API
            String statusUrl = esewaStatusTestUrl +
                    "?product_code=" + productCode +
                    "&total_amount=" + totalAmount +
                    "&transaction_uuid=" + transactionUuid;
            
            // Make HTTP GET request to eSewa status check API
            try {
                String response = restTemplate.getForObject(statusUrl, String.class);
                
                // Parse the JSON response
                Map<String, Object> statusResponse = objectMapper.readValue(response, Map.class);
                
                return ResponseEntity.ok(statusResponse);
            } catch (Exception httpException) {
                // If eSewa API call fails, return error
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("code", 0);
                errorResponse.put("error_message", "Service is currently unavailable");
                errorResponse.put("details", httpException.getMessage());
                
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(errorResponse);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to check payment status: " + e.getMessage());
        }
    }

    private String generateSignature(Map<String, Object> paymentRequest) {
        try {
            String secretKey = esewaSecretKey;
            String signedFieldNames = paymentRequest.get("signed_field_names").toString();
            String[] fields = signedFieldNames.split(",");
            
            // Build the message string in eSewa format: field_name=value,field_name=value
            // eSewa requires: total_amount=<value>,transaction_uuid=<value>,product_code=<value>
            StringBuilder messageBuilder = new StringBuilder();
            for (int i = 0; i < fields.length; i++) {
                if (i > 0) {
                    messageBuilder.append(",");
                }
                String fieldName = fields[i].trim();
                Object fieldValue = paymentRequest.get(fieldName);
                if (fieldValue != null) {
                    // Format: field_name=value
                    messageBuilder.append(fieldName).append("=").append(fieldValue.toString());
                }
            }
            
            String message = messageBuilder.toString();
            
            // Log for debugging (remove in production)
            System.out.println("eSewa Signature Message: " + message);
            System.out.println("eSewa Secret Key: " + secretKey);
            
            // Generate HMAC SHA256 signature
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                secretKey.getBytes(StandardCharsets.UTF_8), 
                "HmacSHA256"
            );
            mac.init(secretKeySpec);
            byte[] hashBytes = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            
            // Convert to Base64
            String signature = Base64.getEncoder().encodeToString(hashBytes);
            System.out.println("Generated Signature: " + signature);
            
            return signature;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate signature: " + e.getMessage(), e);
        }
    }
    
    private boolean verifySignature(Map<String, Object> esewaResponse) {
        try {
            String receivedSignature = esewaResponse.get("signature") != null ? 
                esewaResponse.get("signature").toString() : null;
            
            if (receivedSignature == null || receivedSignature.isEmpty()) {
                return false;
            }
            
            String secretKey = esewaSecretKey;
            String signedFieldNames = esewaResponse.get("signed_field_names") != null ? 
                esewaResponse.get("signed_field_names").toString() : null;
            
            if (signedFieldNames == null || signedFieldNames.isEmpty()) {
                return false;
            }
            
            String[] fields = signedFieldNames.split(",");
            
            // Build the message string in eSewa format: field_name=value,field_name=value
            // Must match the format used in generateSignature
            StringBuilder messageBuilder = new StringBuilder();
            for (int i = 0; i < fields.length; i++) {
                if (i > 0) {
                    messageBuilder.append(",");
                }
                String fieldName = fields[i].trim();
                Object fieldValue = esewaResponse.get(fieldName);
                if (fieldValue != null) {
                    // Format: field_name=value
                    messageBuilder.append(fieldName).append("=").append(fieldValue.toString());
                }
            }
            
            String message = messageBuilder.toString();
            
            // Generate HMAC SHA256 signature
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                secretKey.getBytes(StandardCharsets.UTF_8), 
                "HmacSHA256"
            );
            mac.init(secretKeySpec);
            byte[] hashBytes = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            
            // Convert to Base64
            String calculatedSignature = Base64.getEncoder().encodeToString(hashBytes);
            
            // Compare signatures
            return calculatedSignature.equals(receivedSignature);
        } catch (Exception e) {
            return false;
        }
    }
    
    private Map<String, Object> parseEsewaResponse(String jsonResponse) {
        try {
            return objectMapper.readValue(jsonResponse, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse eSewa response: " + e.getMessage(), e);
        }
    }
}

