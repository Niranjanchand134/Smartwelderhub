package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.Order;
import com.example.smartweldbackend.service.OrderService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private com.example.smartweldbackend.service.NotificationService notificationService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            Order order = new Order();
            order.setCustomerName(orderRequest.getCustomerName());
            order.setCustomerEmail(orderRequest.getCustomerEmail());
            order.setPaymentMethod(orderRequest.getPaymentMethod());
            order.setPaymentStatus(orderRequest.getPaymentStatus());
            order.setTotalAmount(orderRequest.getTotalAmount());

            Order saved = orderService.createOrder(order, orderRequest.getDeliveryInfoId(), orderRequest.getItems());
            
            // Notify admin about new order
            notificationService.notifyAdminAboutNewOrder(
                saved.getCustomerName(), 
                saved.getTotalAmount(), 
                saved.getId()
            );
            
            // If payment method is COD (Cash on Delivery), also notify admin about payment confirmation
            // since COD orders are considered confirmed immediately
            if ("COD".equalsIgnoreCase(saved.getPaymentMethod())) {
                notificationService.notifyAdminAboutPaymentConfirmation(
                    saved.getCustomerName(),
                    saved.getTotalAmount(),
                    saved.getId(),
                    "Cash on Delivery"
                );
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to encode order items");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create order: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    public static class OrderRequest {
        private Long deliveryInfoId;
        private String customerName;
        private String customerEmail;
        private String paymentMethod;
        private String paymentStatus;
        private Double totalAmount;
        private Object items;

        public Long getDeliveryInfoId() {
            return deliveryInfoId;
        }

        public void setDeliveryInfoId(Long deliveryInfoId) {
            this.deliveryInfoId = deliveryInfoId;
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public String getCustomerEmail() {
            return customerEmail;
        }

        public void setCustomerEmail(String customerEmail) {
            this.customerEmail = customerEmail;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }

        public Double getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(Double totalAmount) {
            this.totalAmount = totalAmount;
        }

        public Object getItems() {
            return items;
        }

        public void setItems(Object items) {
            this.items = items;
        }
    }
}

