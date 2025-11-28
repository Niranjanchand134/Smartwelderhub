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
        
        // Validate and deduct stock for each item in the order
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
            
            // If all validations pass, deduct stock
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
        
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}

