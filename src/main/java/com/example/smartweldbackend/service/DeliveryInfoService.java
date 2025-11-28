package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.DeliveryInfo;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.DeliveryInfoRepository;
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

    public void deleteDeliveryInfo(Long id) {
        deliveryInfoRepository.deleteById(id);
    }
}

