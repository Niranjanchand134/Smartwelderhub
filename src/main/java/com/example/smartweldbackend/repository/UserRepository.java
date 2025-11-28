package com.example.smartweldbackend.repository;

import com.example.smartweldbackend.model.user;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<user, Long> {
    Optional<user> findByEmail(String email);
    boolean existsByEmail(String email);
    List<user> findByRole(String role);
    List<user> findByRoleAndStatus(String role, String status);
}

