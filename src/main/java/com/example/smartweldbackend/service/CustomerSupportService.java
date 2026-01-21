package com.example.smartweldbackend.service;

import com.example.smartweldbackend.model.SupportChat;
import com.example.smartweldbackend.model.user;
import com.example.smartweldbackend.repository.SupportChatRepository;
import com.example.smartweldbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerSupportService {

    @Autowired
    private SupportChatRepository supportChatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OpenAIService openAIService;

    @Transactional
    public SupportChat sendUserMessage(Long userId, String message) {
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }

        user user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportChat supportChat = new SupportChat(user, message.trim(), true);
        supportChat = supportChatRepository.save(supportChat);

        try {
            List<String> conversationHistory = getConversationHistory(userId);
            String aiResponse = openAIService.generateResponse(message.trim(), conversationHistory);
            
            SupportChat aiChat = new SupportChat(user, aiResponse, false);
            aiChat = supportChatRepository.save(aiChat);
            
            return supportChat;
        } catch (RuntimeException e) {
            // Check if it's a quota or plan activation error
            String errorMessage = e.getMessage();
            if (errorMessage != null) {
                if (errorMessage.contains("quota") || errorMessage.contains("exceeded") || errorMessage.contains("limit")) {
                    // Save a helpful fallback message for quota errors
                    String fallbackMessage = "I apologize, but I'm currently unable to process your request due to API quota limitations. " +
                        "Please try again later or contact our support team directly for immediate assistance. " +
                        "Thank you for your patience!";
                    SupportChat aiChat = new SupportChat(user, fallbackMessage, false);
                    aiChat = supportChatRepository.save(aiChat);
                    return supportChat;
                }
            }
            throw new RuntimeException("Failed to get AI response: " + errorMessage, e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get AI response: " + e.getMessage(), e);
        }
    }

    public List<SupportChat> getConversation(Long userId) {
        return supportChatRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    private List<String> getConversationHistory(Long userId) {
        List<SupportChat> chats = supportChatRepository.findByUserIdOrderByCreatedAtAsc(userId);
        return chats.stream()
                .map(SupportChat::getMessage)
                .collect(Collectors.toList());
    }
}

