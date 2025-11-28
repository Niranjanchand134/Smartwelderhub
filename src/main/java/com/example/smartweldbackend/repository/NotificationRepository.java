package com.example.smartweldbackend.repository;

import com.example.smartweldbackend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(String targetRole);
    List<Notification> findByTargetRoleIsNullOrderByCreatedAtDesc();
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    List<Notification> findByTargetRoleAndIsReadFalseOrderByCreatedAtDesc(String targetRole);
    Long countByUserIdAndIsReadFalse(Long userId);
    Long countByTargetRoleAndIsReadFalse(String targetRole);
}

