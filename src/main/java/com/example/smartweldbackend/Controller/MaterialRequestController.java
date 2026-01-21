package com.example.smartweldbackend.Controller;

import com.example.smartweldbackend.model.MaterialRequest;
import com.example.smartweldbackend.service.MaterialRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/material-requests")
@CrossOrigin(origins = "http://localhost:5173")
public class MaterialRequestController {

    @Autowired
    private MaterialRequestService materialRequestService;

    @PostMapping
    public ResponseEntity<?> createMaterialRequest(@RequestBody MaterialRequest materialRequest) {
        try {
            MaterialRequest saved = materialRequestService.createMaterialRequest(materialRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create material request: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<MaterialRequest>> getAllMaterialRequests() {
        return ResponseEntity.ok(materialRequestService.getAllMaterialRequests());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<MaterialRequest>> getMaterialRequestsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(materialRequestService.getMaterialRequestsByStatus(status));
    }

    @GetMapping("/welder/{welderId}")
    public ResponseEntity<List<MaterialRequest>> getMaterialRequestsByWelderId(@PathVariable Long welderId) {
        return ResponseEntity.ok(materialRequestService.getMaterialRequestsByWelderId(welderId));
    }

    @GetMapping("/welder/{welderId}/status/{status}")
    public ResponseEntity<List<MaterialRequest>> getMaterialRequestsByWelderIdAndStatus(
            @PathVariable Long welderId,
            @PathVariable String status) {
        return ResponseEntity.ok(materialRequestService.getMaterialRequestsByWelderIdAndStatus(welderId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMaterialRequestById(@PathVariable Long id) {
        try {
            MaterialRequest request = materialRequestService.getMaterialRequestById(id);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveMaterialRequest(
            @PathVariable Long id,
            @RequestBody(required = false) ApproveRequest approveRequest) {
        try {
            String adminNotes = approveRequest != null ? approveRequest.getAdminNotes() : null;
            MaterialRequest approved = materialRequestService.approveMaterialRequest(id, adminNotes);
            return ResponseEntity.ok(approved);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to approve material request: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectMaterialRequest(
            @PathVariable Long id,
            @RequestBody(required = false) RejectRequest rejectRequest) {
        try {
            String rejectionReason = rejectRequest != null ? rejectRequest.getRejectionReason() : null;
            MaterialRequest rejected = materialRequestService.rejectMaterialRequest(id, rejectionReason);
            return ResponseEntity.ok(rejected);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to reject material request: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/fulfill")
    public ResponseEntity<?> fulfillMaterialRequest(@PathVariable Long id) {
        try {
            MaterialRequest fulfilled = materialRequestService.fulfillMaterialRequest(id);
            return ResponseEntity.ok(fulfilled);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fulfill material request: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMaterialRequest(
            @PathVariable Long id,
            @RequestBody MaterialRequest updatedRequest) {
        try {
            MaterialRequest updated = materialRequestService.updateMaterialRequest(id, updatedRequest);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update material request: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaterialRequest(@PathVariable Long id) {
        try {
            materialRequestService.deleteMaterialRequest(id);
            return ResponseEntity.ok().body("Material request deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete material request: " + e.getMessage());
        }
    }

    // Inner classes for request bodies
    public static class ApproveRequest {
        private String adminNotes;

        public String getAdminNotes() {
            return adminNotes;
        }

        public void setAdminNotes(String adminNotes) {
            this.adminNotes = adminNotes;
        }
    }

    public static class RejectRequest {
        private String rejectionReason;

        public String getRejectionReason() {
            return rejectionReason;
        }

        public void setRejectionReason(String rejectionReason) {
            this.rejectionReason = rejectionReason;
        }
    }
}

