package com.example.smartweldbackend.repository;

import com.example.smartweldbackend.model.CustomOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomOrderRepository extends JpaRepository<CustomOrder, Long> {
    List<CustomOrder> findByStatus(String status);
    List<CustomOrder> findByStatusOrderByCreatedAtDesc(String status);
}

