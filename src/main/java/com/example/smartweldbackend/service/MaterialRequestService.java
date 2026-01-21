package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.MaterialRequest;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.MaterialRequestRepository;
import com.example.smartweldbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaterialRequestService {

    @Autowired
    private MaterialRequestRepository materialRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public MaterialRequest createMaterialRequest(MaterialRequest materialRequest) {
        // Validate welder exists
        user welder = userRepository.findById(materialRequest.getWelderId())
                .orElseThrow(() -> new RuntimeException("Welder not found with id: " + materialRequest.getWelderId()));
        
        if (!"WELDER".equals(welder.getRole())) {
            throw new RuntimeException("User is not a welder");
        }

        MaterialRequest saved = materialRequestRepository.save(materialRequest);
        
        // Notify admin about new material request
        notificationService.notifyAdminAboutMaterialRequest(
            saved.getWelderId(),
            welder.getFullName(),
            saved.getMaterialName(),
            saved.getQuantity(),
            saved.getUnit(),
            saved.getId()
        );
        
        return saved;
    }

    public List<MaterialRequest> getAllMaterialRequests() {
        return materialRequestRepository.findAll();
    }

    public List<MaterialRequest> getMaterialRequestsByStatus(String status) {
        return materialRequestRepository.findByStatus(status);
    }

    public List<MaterialRequest> getMaterialRequestsByWelderId(Long welderId) {
        return materialRequestRepository.findByWelderId(welderId);
    }

    public List<MaterialRequest> getMaterialRequestsByWelderIdAndStatus(Long welderId, String status) {
        return materialRequestRepository.findByWelderIdAndStatus(welderId, status);
    }

    public MaterialRequest getMaterialRequestById(Long id) {
        return materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material request not found with id: " + id));
    }

    @Transactional
    public MaterialRequest approveMaterialRequest(Long id, String adminNotes) {
        MaterialRequest request = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material request not found with id: " + id));
        
        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Only pending requests can be approved");
        }
        
        request.setStatus("APPROVED");
        request.setApprovedAt(LocalDateTime.now());
        if (adminNotes != null && !adminNotes.trim().isEmpty()) {
            request.setAdminNotes(adminNotes);
        }
        
        MaterialRequest approved = materialRequestRepository.save(request);
        
        // Notify welder about approval
        notificationService.notifyWelderAboutMaterialRequestApproval(
            approved.getWelderId(),
            approved.getMaterialName(),
            approved.getId()
        );
        
        return approved;
    }

    @Transactional
    public MaterialRequest rejectMaterialRequest(Long id, String rejectionReason) {
        MaterialRequest request = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material request not found with id: " + id));
        
        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Only pending requests can be rejected");
        }
        
        request.setStatus("REJECTED");
        request.setRejectedAt(LocalDateTime.now());
        if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
            request.setRejectionReason(rejectionReason);
        }
        
        MaterialRequest rejected = materialRequestRepository.save(request);
        
        // Notify welder about rejection
        notificationService.notifyWelderAboutMaterialRequestRejection(
            rejected.getWelderId(),
            rejected.getMaterialName(),
            rejected.getRejectionReason(),
            rejected.getId()
        );
        
        return rejected;
    }

    @Transactional
    public MaterialRequest fulfillMaterialRequest(Long id) {
        MaterialRequest request = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material request not found with id: " + id));
        
        if (!"APPROVED".equals(request.getStatus())) {
            throw new RuntimeException("Only approved requests can be fulfilled");
        }
        
        request.setStatus("FULFILLED");
        request.setFulfilledAt(LocalDateTime.now());
        
        MaterialRequest fulfilled = materialRequestRepository.save(request);
        
        // Notify welder about fulfillment
        notificationService.notifyWelderAboutMaterialRequestFulfillment(
            fulfilled.getWelderId(),
            fulfilled.getMaterialName(),
            fulfilled.getId()
        );
        
        return fulfilled;
    }

    @Transactional
    public MaterialRequest updateMaterialRequest(Long id, MaterialRequest updatedRequest) {
        MaterialRequest request = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material request not found with id: " + id));
        
        // Only allow updates to pending requests
        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Only pending requests can be updated");
        }
        
        request.setMaterialName(updatedRequest.getMaterialName());
        request.setMaterialType(updatedRequest.getMaterialType());
        request.setQuantity(updatedRequest.getQuantity());
        request.setUnit(updatedRequest.getUnit());
        request.setDescription(updatedRequest.getDescription());
        request.setPriority(updatedRequest.getPriority());
        
        return materialRequestRepository.save(request);
    }

    @Transactional
    public void deleteMaterialRequest(Long id) {
        MaterialRequest request = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material request not found with id: " + id));
        
        // Only allow deletion of pending or rejected requests
        if (!"PENDING".equals(request.getStatus()) && !"REJECTED".equals(request.getStatus())) {
            throw new RuntimeException("Only pending or rejected requests can be deleted");
        }
        
        materialRequestRepository.delete(request);
    }
}

