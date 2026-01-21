package com.example.smartweldbackend.repository;

import com.example.smartweldbackend.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {

    Optional<Otp> findByEmailAndOtpCodeAndUsedFalse(String email, String otpCode);

    @Modifying
    @Query("DELETE FROM Otp o WHERE o.expiresAt < ?1")
    void deleteExpiredOtps(LocalDateTime now);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Otp o SET o.used = true WHERE o.email = ?1 AND o.used = false")
    void markAllAsUsedByEmail(String email);

    @Query("SELECT o FROM Otp o WHERE o.email = ?1 AND o.used = true ORDER BY o.createdAt DESC")
    java.util.List<Otp> findRecentlyUsedByEmail(String email);
}

