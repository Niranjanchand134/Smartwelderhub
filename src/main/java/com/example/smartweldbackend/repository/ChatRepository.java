package com.example.smartweldbackend.repository;

import com.example.smartweldbackend.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    
    // Get all messages between two users
    List<Chat> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtAsc(
        Long senderId1, Long receiverId1, Long senderId2, Long receiverId2
    );

    // Get all conversations for a user (where they are sender or receiver)
    @Query("SELECT DISTINCT c FROM Chat c WHERE c.sender.id = :userId OR c.receiver.id = :userId ORDER BY c.createdAt DESC")
    List<Chat> findAllConversationsForUser(@Param("userId") Long userId);

    // Get unread messages for a user (where they are receiver)
    List<Chat> findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(Long receiverId);

    // Get unread count for a user
    Long countByReceiverIdAndIsReadFalse(Long receiverId);

    // Get all conversations where user is sender or receiver, grouped by the other participant
    @Query("SELECT c FROM Chat c WHERE (c.sender.id = :userId OR c.receiver.id = :userId) " +
           "AND c.id IN (SELECT MAX(c2.id) FROM Chat c2 WHERE (c2.sender.id = :userId OR c2.receiver.id = :userId) " +
           "GROUP BY CASE WHEN c2.sender.id = :userId THEN c2.receiver.id ELSE c2.sender.id END) " +
           "ORDER BY c.createdAt DESC")
    List<Chat> findLatestMessagesForUser(@Param("userId") Long userId);

    // Get messages between two specific users
    @Query("SELECT c FROM Chat c WHERE (c.sender.id = :userId1 AND c.receiver.id = :userId2) " +
           "OR (c.sender.id = :userId2 AND c.receiver.id = :userId1) ORDER BY c.createdAt ASC")
    List<Chat> findMessagesBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}

