package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.Chat;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.ChatRepository;
import com.example.smartweldbackend.repository.UserRepository;
import com.example.smartweldbackend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Chat sendMessage(Long senderId, Long receiverId, String message) {
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }

        user sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        user receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Chat chat = new Chat(sender, receiver, message.trim());
        Chat savedChat = chatRepository.save(chat);
        
        // Notify welder if receiver is a welder and sender is a customer
        if ("WELDER".equals(receiver.getRole()) && !"WELDER".equals(sender.getRole()) && !"ADMIN".equals(sender.getRole())) {
            String senderName = sender.getFullName() != null ? sender.getFullName() : sender.getEmail();
            String messagePreview = message.trim().length() > 50 ? message.trim().substring(0, 50) + "..." : message.trim();
            notificationService.createNotification(
                "New Message from " + senderName,
                messagePreview,
                "CHAT_MESSAGE",
                receiverId,
                null
            );
        }
        
        return savedChat;
    }

    @Transactional
    public Chat sendMessageWithImage(Long senderId, Long receiverId, String message, String imageUrl) {
        if ((message == null || message.trim().isEmpty()) && imageUrl == null) {
            throw new IllegalArgumentException("Message or image is required");
        }

        user sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        user receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Chat chat = new Chat(sender, receiver, message != null ? message.trim() : "");
        chat.setImageUrl(imageUrl);
        Chat savedChat = chatRepository.save(chat);
        
        // Notify welder if receiver is a welder and sender is a customer
        if ("WELDER".equals(receiver.getRole()) && !"WELDER".equals(sender.getRole()) && !"ADMIN".equals(sender.getRole())) {
            String senderName = sender.getFullName() != null ? sender.getFullName() : sender.getEmail();
            String messageText = message != null && !message.trim().isEmpty() 
                ? (message.trim().length() > 50 ? message.trim().substring(0, 50) + "..." : message.trim())
                : "sent an image";
            notificationService.createNotification(
                "New Message from " + senderName,
                messageText,
                "CHAT_MESSAGE",
                receiverId,
                null
            );
        }
        
        return savedChat;
    }

    public List<Chat> getMessagesBetweenUsers(Long userId1, Long userId2) {
        return chatRepository.findMessagesBetweenUsers(userId1, userId2);
    }

    // Get all conversations for a welder (all users they've chatted with)
    public List<Chat> getWelderConversations(Long welderId) {
        return chatRepository.findLatestMessagesForUser(welderId);
    }

    // Get all conversations for a user (their conversation with welder)
    public List<Chat> getUserConversations(Long userId) {
        return chatRepository.findLatestMessagesForUser(userId);
    }

    // Get conversation with a specific user for welder
    public List<Chat> getConversationWithUser(Long welderId, Long userId) {
        return chatRepository.findMessagesBetweenUsers(welderId, userId);
    }

    // Get conversation with welder for user
    public List<Chat> getConversationWithWelder(Long userId, Long welderId) {
        return chatRepository.findMessagesBetweenUsers(userId, welderId);
    }

    public Long getUnreadCount(Long userId) {
        return chatRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    public List<Chat> getUnreadMessages(Long userId) {
        return chatRepository.findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markMessagesAsRead(Long userId, Long otherUserId) {
        List<Chat> unreadMessages = chatRepository.findMessagesBetweenUsers(userId, otherUserId)
                .stream()
                .filter(chat -> chat.getReceiver().getId().equals(userId) && !chat.getIsRead())
                .collect(Collectors.toList());
        
        for (Chat chat : unreadMessages) {
            chat.setIsRead(true);
        }
        chatRepository.saveAll(unreadMessages);
    }

    @Transactional
    public Chat markMessageAsRead(Long messageId) {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        chat.setIsRead(true);
        return chatRepository.save(chat);
    }

    // Get the other participant in a conversation
    public user getOtherParticipant(Long currentUserId, Long conversationUserId) {
        // This is a helper method to get the other user in a conversation
        // For welder-user chats, we need to find the welder or user
        user currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if ("WELDER".equals(currentUser.getRole())) {
            // If current user is welder, find the user they're chatting with
            return userRepository.findById(conversationUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else {
            // If current user is regular user, find a welder to chat with
            // For now, we'll get the first active welder, but this can be customized
            List<user> welders = userRepository.findByRole("WELDER");
            return welders.stream()
                    .filter(w -> w.getStatus() != null && ("ACTIVE".equals(w.getStatus()) || "VERIFIED".equals(w.getStatus())))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No active welder found"));
        }
    }

    // Get or create a conversation between user and welder
    public Long getOrCreateConversation(Long userId, Long welderId) {
        // Check if there's already a conversation
        List<Chat> existingMessages = chatRepository.findMessagesBetweenUsers(userId, welderId);
        if (!existingMessages.isEmpty()) {
            return welderId; // Return the welder ID as conversation ID
        }
        // If no conversation exists, return the welder ID (conversation will be created on first message)
        return welderId;
    }

    // Get available welders for a user to chat with
    public List<user> getAvailableWelders() {
        List<user> welders = userRepository.findByRole("WELDER");
        return welders.stream()
                .filter(w -> w.getStatus() != null && ("ACTIVE".equals(w.getStatus()) || "VERIFIED".equals(w.getStatus())))
                .collect(java.util.stream.Collectors.toList());
    }
}

