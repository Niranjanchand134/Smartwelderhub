package com.example.smartweldbackend.repository;

import com.example.smartweldbackend.model.SupportChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportChatRepository extends JpaRepository<SupportChat, Long> {
    
    List<SupportChat> findByUserIdOrderByCreatedAtAsc(Long userId);
    
    @Query("SELECT s FROM SupportChat s WHERE s.user.id = :userId ORDER BY s.createdAt ASC")
    List<SupportChat> findSupportChatsByUserId(@Param("userId") Long userId);
}

