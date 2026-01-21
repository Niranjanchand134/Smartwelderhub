package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.DeliveryInfo;
import com.example.smartweldbackend.model.Order;
import com.example.smartweldbackend.repository.DeliveryInfoRepository;
import com.example.smartweldbackend.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DeliveryInfoRepository deliveryInfoRepository;

    @Autowired
    private ProductService productService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Order createOrder(Order order, Long deliveryInfoId, Object items) throws JsonProcessingException {
        DeliveryInfo deliveryInfo = deliveryInfoRepository.findById(deliveryInfoId)
                .orElseThrow(() -> new RuntimeException("Delivery info not found"));
        order.setDeliveryInfo(deliveryInfo);
        order.setItemsJson(objectMapper.writeValueAsString(items));
        
        // Validate stock for all items
        if (items instanceof List) {
            List<?> itemsList = (List<?>) items;
            
            // First, validate all items have sufficient stock
            for (Object item : itemsList) {
                if (item instanceof Map) {
                    Map<String, Object> itemMap = (Map<String, Object>) item;
                    Long productId = Long.valueOf(itemMap.get("productId").toString());
                    Integer quantity = Integer.valueOf(itemMap.get("quantity").toString());
                    
                    // Validate stock availability
                    if (!productService.checkStockAvailability(productId, quantity)) {
                        throw new RuntimeException("Insufficient stock for product ID: " + productId);
                    }
                }
            }
            
            // Only deduct stock for COD (Cash on Delivery) orders
            // For eSewa/online payments, stock will be deducted after payment verification
            String paymentMethod = order.getPaymentMethod();
            if (paymentMethod != null && "COD".equalsIgnoreCase(paymentMethod)) {
                // Deduct stock immediately for COD orders
                for (Object item : itemsList) {
                    if (item instanceof Map) {
                        Map<String, Object> itemMap = (Map<String, Object>) item;
                        Long productId = Long.valueOf(itemMap.get("productId").toString());
                        Integer quantity = Integer.valueOf(itemMap.get("quantity").toString());
                        
                        // Deduct stock
                        productService.deductStock(productId, quantity);
                    }
                }
            }
            // For eSewa and other online payments, stock will be deducted after payment verification
            // in PaymentController.verifyEsewaPayment()
        }
        
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}

