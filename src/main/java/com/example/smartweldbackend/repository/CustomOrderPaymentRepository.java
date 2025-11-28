package com.example.smartweldbackend.repository;

import com.example.smartweldbackend.model.CustomOrderPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomOrderPaymentRepository extends JpaRepository<CustomOrderPayment, Long> {
    List<CustomOrderPayment> findByCustomOrderId(Long customOrderId);
    List<CustomOrderPayment> findByPaymentStatus(String paymentStatus);
}

