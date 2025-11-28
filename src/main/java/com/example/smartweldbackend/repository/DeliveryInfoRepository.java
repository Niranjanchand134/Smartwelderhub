package com.example.smartweldbackend.repository;

import com.example.smartweldbackend.model.DeliveryInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryInfoRepository extends JpaRepository<DeliveryInfo, Long> {
    List<DeliveryInfo> findByEmail(String email);
    List<DeliveryInfo> findByUserId(Long userId);
    List<DeliveryInfo> findByUserIdAndSaveAddressTrue(Long userId);
}

