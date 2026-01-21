package com.example.smartweldbackend.repository;

import com.example.smartweldbackend.model.Order;
import com.example.smartweldbackend.model.DeliveryInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByDeliveryInfo(DeliveryInfo deliveryInfo);
    boolean existsByDeliveryInfo(DeliveryInfo deliveryInfo);
}

