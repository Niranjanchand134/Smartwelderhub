package com.example.smartweldbackend.config;

import com.example.smartweldbackend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            
            // Validate token
            if (jwtUtil.isTokenExpired(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // Extract user details from token
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractClaim(token, claims -> {
                Object roleObj = claims.get("role");
                return roleObj != null ? roleObj.toString() : null;
            });
            
            Long userId = jwtUtil.extractClaim(token, claims -> {
                Object idObj = claims.get("id");
                if (idObj instanceof Number) {
                    return ((Number) idObj).longValue();
                }
                return null;
            });

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Create authorities based on role
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                if (role != null) {
                    // Add ROLE_ prefix for Spring Security
                    String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
                    authorities.add(new SimpleGrantedAuthority(roleWithPrefix));
                    
                    // Also add ADMIN role for admin users
                    if ("ADMIN".equalsIgnoreCase(role)) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                    }
                }

                // Create authentication token
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(email, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set authentication in SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Log error but continue filter chain
            logger.error("Cannot set user authentication: {}", e);
        }

        filterChain.doFilter(request, response);
    }
}

