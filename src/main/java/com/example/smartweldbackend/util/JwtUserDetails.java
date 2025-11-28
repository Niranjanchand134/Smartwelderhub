package com.example.smartweldbackend.util;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * UserDetails implementation for JWT authentication
 * This class represents the authenticated user's details
 */
public class JwtUserDetails implements UserDetails {

    private final String email;
    private final String role;
    private final Long userId;
    private final Collection<? extends GrantedAuthority> authorities;

    public JwtUserDetails(String email, String role, Long userId) {
        this.email = email;
        this.role = role;
        this.userId = userId;
        
        // Build authorities from role
        List<GrantedAuthority> auths = new ArrayList<>();
        if (role != null) {
            String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
            auths.add(new SimpleGrantedAuthority(roleWithPrefix));
            
            // Add ADMIN role for admin users
            if ("ADMIN".equalsIgnoreCase(role)) {
                auths.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            }
        }
        this.authorities = auths;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null; // JWT doesn't store password
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public String getRole() {
        return role;
    }

    public Long getUserId() {
        return userId;
    }
}

