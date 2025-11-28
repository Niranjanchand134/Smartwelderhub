package com.example.smartweldbackend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - no authentication required
                .requestMatchers("/userLogin", "/registers", "/", "/test-auth").permitAll()
                .requestMatchers("/api/admin-setup/**").permitAll() // Allow admin setup endpoints (development only)
                .requestMatchers("/api/user/role").authenticated() // Allow authenticated users to check their role
                .requestMatchers("/api/user/getUserDetailsById/**").authenticated() // Allow authenticated users to get their own profile
                .requestMatchers("/api/user/updateProfile/**").authenticated() // Allow authenticated users to update their own profile
                
                // Admin-only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users").hasRole("ADMIN") // Admin-only: Get all users
                
                // Admin notification endpoints
                .requestMatchers("/api/notifications/admin/**").hasRole("ADMIN")
                
                // User notification endpoints - authenticated users only
                .requestMatchers("/api/notifications/user/**").authenticated()
                
                // Order endpoints - authenticated users only
                .requestMatchers("/api/orders/**").authenticated()
                
                // Payment endpoints - authenticated users only
                .requestMatchers("/api/payment/**").authenticated()
                
                // Delivery info endpoints - authenticated users only
                .requestMatchers("/api/delivery/**").authenticated()
                
                // Product endpoints - allow public read, admin write
                .requestMatchers("GET", "/api/products/**").permitAll()
                .requestMatchers("POST", "/api/products/**").hasRole("ADMIN")
                .requestMatchers("PUT", "/api/products/**").hasRole("ADMIN")
                .requestMatchers("DELETE", "/api/products/**").hasRole("ADMIN")
                
                // All other API endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                
                // Allow all other requests (static resources, etc.)
                .anyRequest().permitAll()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

