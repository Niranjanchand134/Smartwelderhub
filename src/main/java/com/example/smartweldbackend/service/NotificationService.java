package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.Notification;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.NotificationRepository;
import com.example.smartweldbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public Notification createNotification(String title, String message, String type, Long userId, String targetRole) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setTargetRole(targetRole);
        notification.setIsRead(false);

        if (userId != null) {
            user user = userRepository.findById(userId)
                    .orElse(null);
            notification.setUser(user);
        }

        return notificationRepository.save(notification);
    }

    // Notify all users about new product
    @Transactional
    public void notifyAllUsersAboutNewProduct(String productName) {
        List<user> allUsers = userRepository.findAll();
        for (user user : allUsers) {
            if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
                Notification notification = new Notification();
                notification.setTitle("New Product Added");
                notification.setMessage("A new product '" + productName + "' has been added to our store!");
                notification.setType("PRODUCT_ADDED");
                notification.setUser(user);
                notification.setIsRead(false);
                notificationRepository.save(notification);
            }
        }
    }

    // Notify admin about new user registration
    public void notifyAdminAboutNewUser(String userName, String userEmail) {
        Notification notification = new Notification();
        notification.setTitle("New User Registration");
        notification.setMessage("A new user '" + userName + "' (" + userEmail + ") has registered.");
        notification.setType("USER_REGISTERED");
        notification.setTargetRole("ADMIN");
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    // Notify admin about new order
    public void notifyAdminAboutNewOrder(String customerName, Double totalAmount, Long orderId) {
        Notification notification = new Notification();
        notification.setTitle("New Order Placed");
        notification.setMessage("Customer '" + customerName + "' has placed an order of Rs. " + totalAmount + " (Order ID: " + orderId + ")");
        notification.setType("ORDER_PLACED");
        notification.setTargetRole("ADMIN");
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    // Notify admin about payment confirmation/purchase completion
    public void notifyAdminAboutPaymentConfirmation(String customerName, Double totalAmount, Long orderId, String paymentMethod) {
        Notification notification = new Notification();
        notification.setTitle("Purchase Confirmed");
        notification.setMessage("Customer '" + customerName + "' has confirmed purchase of Rs. " + totalAmount + " via " + paymentMethod + " (Order ID: " + orderId + ")");
        notification.setType("PAYMENT_CONFIRMED");
        notification.setTargetRole("ADMIN");
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getAdminNotifications() {
        List<Notification> roleBased = notificationRepository.findByTargetRoleOrderByCreatedAtDesc("ADMIN");
        List<Notification> allAdmins = notificationRepository.findByTargetRoleIsNullOrderByCreatedAtDesc();
        roleBased.addAll(allAdmins);
        return roleBased.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .distinct()
                .toList();
    }

    // Get all notifications for admin (only admin-specific: new users, new orders, payment confirmations)
    public List<Notification> getAllNotificationsForAdmin(Long adminUserId) {
        // Only return admin-specific notifications (USER_REGISTERED, ORDER_PLACED, PAYMENT_CONFIRMED)
        // Exclude PRODUCT_ADDED notifications which are for regular users only
        List<Notification> adminNotifications = getAdminNotifications();
        
        // Filter to only include admin-specific notification types (user activities)
        return adminNotifications.stream()
                .filter(n -> ("USER_REGISTERED".equals(n.getType()) || "ORDER_PLACED".equals(n.getType()) || "PAYMENT_CONFIRMED".equals(n.getType())) &&
                            "ADMIN".equals(n.getTargetRole()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .distinct()
                .toList();
    }

    public List<Notification> getUnreadUserNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadAdminNotifications() {
        return notificationRepository.findByTargetRoleAndIsReadFalseOrderByCreatedAtDesc("ADMIN");
    }

    public Long getUnreadCountForUser(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public Long getUnreadCountForAdmin() {
        return notificationRepository.countByTargetRoleAndIsReadFalse("ADMIN");
    }

    // Get unread count for admin (only admin-specific notifications)
    public Long getAllUnreadCountForAdmin(Long adminUserId) {
        // Only count admin-specific notifications (new users, new orders, payment confirmations)
        List<Notification> adminNotifications = notificationRepository.findByTargetRoleOrderByCreatedAtDesc("ADMIN");
        long count = adminNotifications.stream()
                .filter(n -> !n.getIsRead() && 
                           ("USER_REGISTERED".equals(n.getType()) || "ORDER_PLACED".equals(n.getType()) || "PAYMENT_CONFIRMED".equals(n.getType())))
                .count();
        return count;
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsReadForUser(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void markAllAsReadForAdmin() {
        List<Notification> notifications = notificationRepository.findByTargetRoleAndIsReadFalseOrderByCreatedAtDesc("ADMIN");
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void markAllAsReadForAdminUser(Long adminUserId) {
        // Mark only admin-specific notifications as read (new users, new orders, payment confirmations)
        List<Notification> adminNotifications = notificationRepository.findByTargetRoleAndIsReadFalseOrderByCreatedAtDesc("ADMIN");
        List<Notification> filteredNotifications = adminNotifications.stream()
                .filter(n -> "USER_REGISTERED".equals(n.getType()) || "ORDER_PLACED".equals(n.getType()) || "PAYMENT_CONFIRMED".equals(n.getType()))
                .toList();
        for (Notification notification : filteredNotifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(filteredNotifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}

