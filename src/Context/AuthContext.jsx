import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { checkAuth } from "../services/authService";
import { 
  getActiveToken, 
  getActiveUserInfo, 
  getActiveSessionEmail,
  switchToUserSession,
  clearUserSession,
  cleanupLegacyKeys
} from "../utils/sessionManager";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Initialize from active session
  const [authToken, setAuthToken] = useState(() => {
    return getActiveToken();
  });
  const [user, setUser] = useState(() => {
    const token = getActiveToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return {
          email: decoded.sub || decoded.email,
          name: decoded.name || decoded.fullName,
          role: decoded.role,
          id: decoded.id,
          fullName: decoded.fullName || decoded.name,
        };
      } catch (err) {
        console.error("Invalid token:", err);
        return null;
      }
    }
    return null;
  });

  // Decode token to extract user info
  function decodeToken(token) { 
    try {
      const decoded = jwtDecode(token);
      return {
        email: decoded.sub || decoded.email,
        name: decoded.name || decoded.fullName,
        role: decoded.role,
        id: decoded.id,
        fullName: decoded.fullName || decoded.name,
      };
    } catch (err) {
      console.error("Invalid token:", err);
      return null;
    }
  }

  useEffect(() => {
    if (authToken) {
      const decodedUser = decodeToken(authToken);
      if (decodedUser) {
        console.log("AuthContext - User decoded from token:", decodedUser);
        setUser(decodedUser);
        // Store in session manager
        switchToUserSession(decodedUser.email, authToken, decodedUser);
      } else {
        // Invalid token, clear everything
        const activeEmail = getActiveSessionEmail();
        if (activeEmail) {
          clearUserSession(activeEmail);
        }
        setAuthToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [authToken]);

  // Clean up legacy keys on mount
  useEffect(() => {
    cleanupLegacyKeys();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const verifyToken = async () => {
        try {
          await checkAuth();
          // Token is valid
        } catch (error) {
          // Only clear on explicit unauthorized / 401 responses
          console.error("Authentication check failed:", error.message);
          if (error.message === "Unauthorized") {
            const activeEmail = getActiveSessionEmail();
            if (activeEmail) {
              clearUserSession(activeEmail);
            }
            setAuthToken(null);
            setUser(null);
          }
        }
      };

      const activeToken = getActiveToken();
      if (activeToken) {
        verifyToken();
      }
    }, 2000);

    // Run once on mount only
    return () => clearTimeout(timeoutId);
  }, []);

  const login = (token) => {
    setAuthToken(token);
  };

  // Logout function - clears current user's session and removes JWT tokens
  const logout = () => {
    const activeEmail = getActiveSessionEmail();
    if (activeEmail) {
      // Clear current user's session (this also removes JWT token)
      clearUserSession(activeEmail);
      
      // Clear cart for current user
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`weldpro-cart-${activeEmail.toLowerCase()}`) || 
            key.startsWith('weldpro-cart-guest')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Ensure legacy keys are also removed
    cleanupLegacyKeys();
    
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
