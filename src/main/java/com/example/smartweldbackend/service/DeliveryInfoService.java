package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.DeliveryInfo;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.DeliveryInfoRepository;
import com.example.smartweldbackend.repository.OrderRepository;
import com.example.smartweldbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeliveryInfoService {

    @Autowired
    private DeliveryInfoRepository deliveryInfoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    public DeliveryInfo createDeliveryInfo(DeliveryInfo deliveryInfo, String userEmail) {
        if (userEmail != null && !userEmail.isEmpty()) {
            Optional<user> userOptional = userRepository.findByEmail(userEmail);
            if (userOptional.isPresent()) {
                deliveryInfo.setUser(userOptional.get());
            }
        }
        return deliveryInfoRepository.save(deliveryInfo);
    }

    public DeliveryInfo updateDeliveryInfo(Long id, DeliveryInfo updatedInfo) {
        DeliveryInfo existing = deliveryInfoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery info not found"));
        
        existing.setFullName(updatedInfo.getFullName());
        existing.setEmail(updatedInfo.getEmail());
        existing.setPhone(updatedInfo.getPhone());
        existing.setAddress(updatedInfo.getAddress());
        existing.setCity(updatedInfo.getCity());
        existing.setState(updatedInfo.getState());
        existing.setZipCode(updatedInfo.getZipCode());
        existing.setWardNumber(updatedInfo.getWardNumber());
        existing.setAlternatePhoneNumber(updatedInfo.getAlternatePhoneNumber());
        existing.setDeliveryInstructions(updatedInfo.getDeliveryInstructions());
        existing.setLandmark(updatedInfo.getLandmark());
        existing.setCountry(updatedInfo.getCountry());
        existing.setSaveAddress(updatedInfo.getSaveAddress());
        
        return deliveryInfoRepository.save(existing);
    }

    public List<DeliveryInfo> getAllDeliveryInfo() {
        return deliveryInfoRepository.findAll();
    }

    public List<DeliveryInfo> getDeliveryInfoByEmail(String email) {
        return deliveryInfoRepository.findByEmail(email);
    }

    public List<DeliveryInfo> getSavedDeliveryInfoByUserId(Long userId) {
        return deliveryInfoRepository.findByUserIdAndSaveAddressTrue(userId);
    }

    public List<DeliveryInfo> getDeliveryInfoByUserId(Long userId) {
        return deliveryInfoRepository.findByUserId(userId);
    }

    public DeliveryInfo getDeliveryInfoById(Long id) {
        return deliveryInfoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery info not found"));
    }

    public void deleteDeliveryInfo(Long id) {
        DeliveryInfo deliveryInfo = deliveryInfoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery info not found"));
        
        // Check if there are any orders using this delivery info
        List<com.example.smartweldbackend.model.Order> orders = orderRepository.findByDeliveryInfo(deliveryInfo);
        if (!orders.isEmpty()) {
            int orderCount = orders.size();
            throw new RuntimeException("Cannot delete address: This address is associated with " + orderCount + 
                (orderCount == 1 ? " order" : " orders") + 
                ". Please delete or update the orders first.");
        }
        
        deliveryInfoRepository.deleteById(id);
    }
}

