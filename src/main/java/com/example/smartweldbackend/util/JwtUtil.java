package com.example.smartweldbackend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String USER_SECRET_KEY = "SmartWeldUserSecretKeyForJWTTokenGeneration12345678901234567890";
    private static final String ADMIN_SECRET_KEY = "SmartWeldAdminSecretKeyForJWTTokenGeneration98765432109876543210";
    private static final String WELDER_SECRET_KEY = "SmartWeldWelderSecretKeyForJWTTokenGeneration56789012345678901234";
    private static final long USER_JWT_EXPIRATION = 86400000; // 24 hours in milliseconds
    private static final long ADMIN_JWT_EXPIRATION = 604800000; // 7 days in milliseconds (longer for admin)
    private static final long WELDER_JWT_EXPIRATION = 604800000; // 7 days in milliseconds (same as admin for welders)

    private SecretKey getUserSigningKey() {
        return Keys.hmacShaKeyFor(USER_SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    private SecretKey getAdminSigningKey() {
        return Keys.hmacShaKeyFor(ADMIN_SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    private SecretKey getWelderSigningKey() {
        return Keys.hmacShaKeyFor(WELDER_SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Legacy method - determines admin vs user vs welder automatically
     * For new code, use generateAdminToken(), generateWelderToken(), or generateUserToken() directly
     */
    public String generateToken(String email, String role, Long userId) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return generateAdminToken(email, userId);
        } else if ("WELDER".equalsIgnoreCase(role)) {
            return generateWelderToken(email, userId);
        } else {
            return generateUserToken(email, role, userId);
        }
    }

    /**
     * Generate admin-specific token with extended expiration and different signing key
     */
    public String generateAdminToken(String email, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ADMIN");
        claims.put("id", userId);
        claims.put("email", email);
        claims.put("tokenType", "ADMIN_TOKEN");
        claims.put("issuer", "SmartWeld-Admin");
        claims.put("scope", "admin:all");
        claims.put("permissions", new String[]{"read:all", "write:all", "delete:all", "manage:users"});
        return createAdminToken(claims, email);
    }

    /**
     * Generate welder-specific token with extended expiration and different signing key
     */
    public String generateWelderToken(String email, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "WELDER");
        claims.put("id", userId);
        claims.put("email", email);
        claims.put("tokenType", "WELDER_TOKEN");
        claims.put("issuer", "SmartWeld-Welder");
        claims.put("scope", "welder:all");
        claims.put("permissions", new String[]{"read:jobs", "write:jobs", "manage:materials", "chat:customers"});
        return createWelderToken(claims, email);
    }

    /**
     * Generate user-specific token with standard expiration
     */
    public String generateUserToken(String email, String role, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role != null ? role.toUpperCase() : "USER");
        claims.put("id", userId);
        claims.put("email", email);
        claims.put("tokenType", "USER_TOKEN");
        claims.put("issuer", "SmartWeld-User");
        claims.put("scope", "user:standard");
        return createUserToken(claims, email);
    }

    /**
     * Extract token type from JWT
     */
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> {
            Object tokenType = claims.get("tokenType");
            return tokenType != null ? tokenType.toString() : "USER_TOKEN";
        });
    }

    /**
     * Check if token is an admin token - checks signing key, token type, and role
     */
    public Boolean isAdminToken(String token) {
        try {
            // First check if signed with admin key (most reliable)
            if (isSignedWithAdminKey(token)) {
                return true;
            }
            
            // Also check token type and role claims
            String tokenType = extractTokenType(token);
            String role = extractClaim(token, claims -> {
                Object roleObj = claims.get("role");
                return roleObj != null ? roleObj.toString() : null;
            });
            return "ADMIN_TOKEN".equals(tokenType) || "ADMIN".equalsIgnoreCase(role);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Check if token is a welder token - checks signing key, token type, and role
     */
    public Boolean isWelderToken(String token) {
        try {
            // First check if signed with welder key (most reliable)
            if (isSignedWithWelderKey(token)) {
                return true;
            }
            
            // Also check token type and role claims
            String tokenType = extractTokenType(token);
            String role = extractClaim(token, claims -> {
                Object roleObj = claims.get("role");
                return roleObj != null ? roleObj.toString() : null;
            });
            return "WELDER_TOKEN".equals(tokenType) || "WELDER".equalsIgnoreCase(role);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Create admin token with admin-specific secret key and longer expiration
     */
    private String createAdminToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + ADMIN_JWT_EXPIRATION))
                .signWith(getAdminSigningKey())
                .compact();
    }

    /**
     * Create welder token with welder-specific secret key and extended expiration
     */
    private String createWelderToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + WELDER_JWT_EXPIRATION))
                .signWith(getWelderSigningKey())
                .compact();
    }

    /**
     * Create user token with user-specific secret key and standard expiration
     */
    private String createUserToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + USER_JWT_EXPIRATION))
                .signWith(getUserSigningKey())
                .compact();
    }

    /**
     * Legacy method for backward compatibility - determines token type from role
     */
    private String createToken(Map<String, Object> claims, String subject) {
        String tokenType = (String) claims.get("tokenType");
        if ("ADMIN_TOKEN".equals(tokenType)) {
            return createAdminToken(claims, subject);
        } else if ("WELDER_TOKEN".equals(tokenType)) {
            return createWelderToken(claims, subject);
        } else {
            return createUserToken(claims, subject);
        }
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        // Try to parse with admin key first, then welder key, then user key
        try {
            return Jwts.parser()
                    .verifyWith(getAdminSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e1) {
            try {
                // If admin key fails, try welder key
                return Jwts.parser()
                        .verifyWith(getWelderSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
            } catch (Exception e2) {
                // If welder key fails, try user key
                return Jwts.parser()
                        .verifyWith(getUserSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
            }
        }
    }
    
    /**
     * Determine which signing key was used for this token
     */
    private boolean isSignedWithAdminKey(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getAdminSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Determine if token was signed with welder key
     */
    private boolean isSignedWithWelderKey(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getWelderSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            return true; // If we can't parse expiration, consider it expired
        }
    }

    public Boolean validateToken(String token, String email) {
        final String tokenEmail = extractEmail(token);
        return (tokenEmail.equals(email) && !isTokenExpired(token));
    }
}

