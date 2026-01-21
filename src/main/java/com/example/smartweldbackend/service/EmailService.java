package com.example.smartweldbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("niranjachand134@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Password Reset OTP - SmartWeld");
            message.setText("Dear User,\n\n" +
                    "You have requested to reset your password. Please use the following OTP to proceed:\n\n" +
                    "OTP: " + otpCode + "\n\n" +
                    "This OTP is valid for 10 minutes. Do not share this OTP with anyone.\n\n" +
                    "If you did not request this password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "SmartWeld Team");

            mailSender.send(message);
            System.out.println("OTP email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }
}

