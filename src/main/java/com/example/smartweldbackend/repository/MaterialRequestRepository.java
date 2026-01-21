package com.example.smartweldbackend.repository;

import com.example.smartweldbackend.model.MaterialRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRequestRepository extends JpaRepository<MaterialRequest, Long> {
    List<MaterialRequest> findByWelderId(Long welderId);
    List<MaterialRequest> findByStatus(String status);
    List<MaterialRequest> findByWelderIdAndStatus(Long welderId, String status);
    Optional<MaterialRequest> findByRequestNumber(String requestNumber);
    List<MaterialRequest> findByPriority(String priority);
    List<MaterialRequest> findByMaterialType(String materialType);
}

