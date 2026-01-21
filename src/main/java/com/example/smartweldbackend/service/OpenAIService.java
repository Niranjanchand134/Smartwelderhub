package com.example.smartweldbackend.service;

import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatMessageRole;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class OpenAIService {

    private final OpenAiService openAiService;
    private final String model;
    private final Double temperature;
    private final Integer maxTokens;
    
    private static final String SYSTEM_PROMPT = "You are a helpful customer support assistant for SmartWeld, a welding services platform. " +
            "You help customers with questions about welding services, orders, pricing, and general inquiries. " +
            "Be friendly, professional, and concise. If you don't know something, politely say so and suggest contacting support.";

    public OpenAIService(
            @Value("${openai.api.key:}") String apiKey,
            @Value("${openai.api.model:gpt-4o-mini}") String model,
            @Value("${openai.api.temperature:0.8}") Double temperature,
            @Value("${openai.api.max-tokens:160}") Integer maxTokens) {
        String key = apiKey;
        if (key == null || key.trim().isEmpty()) {
            key = System.getProperty("OPENAI_API_KEY");
        }
        if (key == null || key.trim().isEmpty()) {
            key = System.getenv("OPENAI_API_KEY");
        }
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalStateException("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable or in .env file.");
        }
        this.openAiService = new OpenAiService(key, Duration.ofSeconds(30));
        this.model = model != null && !model.trim().isEmpty() ? model : "gpt-4o-mini";
        this.temperature = temperature != null ? temperature : 0.8;
        this.maxTokens = maxTokens != null ? maxTokens : 160;
    }

    public String generateResponse(String userMessage, List<String> conversationHistory) {
        try {
            List<ChatMessage> messages = new ArrayList<>();
            
            messages.add(new ChatMessage(ChatMessageRole.SYSTEM.value(), SYSTEM_PROMPT));
            
            if (conversationHistory != null && !conversationHistory.isEmpty()) {
                for (int i = 0; i < conversationHistory.size(); i += 2) {
                    if (i < conversationHistory.size()) {
                        messages.add(new ChatMessage(ChatMessageRole.USER.value(), conversationHistory.get(i)));
                    }
                    if (i + 1 < conversationHistory.size()) {
                        messages.add(new ChatMessage(ChatMessageRole.ASSISTANT.value(), conversationHistory.get(i + 1)));
                    }
                }
            }
            
            messages.add(new ChatMessage(ChatMessageRole.USER.value(), userMessage));

            ChatCompletionRequest chatCompletionRequest = ChatCompletionRequest
                    .builder()
                    .model(this.model)
                    .messages(messages)
                    .maxTokens(this.maxTokens)
                    .temperature(this.temperature)
                    .build();

            return openAiService.createChatCompletion(chatCompletionRequest)
                    .getChoices()
                    .get(0)
                    .getMessage()
                    .getContent();
        } catch (Exception e) {
            String errorMessage = e.getMessage();
            if (errorMessage != null && (errorMessage.toLowerCase().contains("quota") || 
                errorMessage.toLowerCase().contains("billing") || 
                errorMessage.toLowerCase().contains("exceeded"))) {
                throw new RuntimeException("OpenAI API quota exceeded. Please check your OpenAI account billing and quota settings. " + 
                    "For more information, visit: https://platform.openai.com/docs/guides/error-codes/api-errors", e);
            }
            throw new RuntimeException("Failed to generate AI response: " + errorMessage, e);
        }
    }
}

