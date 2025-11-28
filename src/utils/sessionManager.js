/**
 * Session Manager Utility
 * 
 * Manages multiple user sessions in the same browser.
 * Each user session is stored with a unique key based on email.
 * Only one session can be active at a time.
 */

const SESSION_KEY_PREFIX = 'token-';
const ACTIVE_SESSION_KEY = 'activeSession';
const USER_INFO_PREFIX = 'user-';

/**
 * Get session storage key for a user
 * @param {string} email - User email
 * @returns {string} Storage key
 */
export const getSessionKey = (email) => {
  if (!email) return null;
  return `${SESSION_KEY_PREFIX}${email.toLowerCase()}`;
};

/**
 * Get user info storage key
 * @param {string} email - User email
 * @returns {string} Storage key
 */
export const getUserInfoKey = (email) => {
  if (!email) return null;
  return `${USER_INFO_PREFIX}${email.toLowerCase()}`;
};

/**
 * Get the currently active session email
 * @returns {string|null} Active user email or null
 */
export const getActiveSessionEmail = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_SESSION_KEY);
};

/**
 * Set the active session
 * @param {string} email - User email to set as active
 */
export const setActiveSession = (email) => {
  if (typeof window === 'undefined' || !email) return;
  localStorage.setItem(ACTIVE_SESSION_KEY, email.toLowerCase());
};

/**
 * Get token for a specific user
 * @param {string} email - User email
 * @returns {string|null} Token or null
 */
export const getTokenForUser = (email) => {
  if (typeof window === 'undefined' || !email) return null;
  const key = getSessionKey(email);
  return localStorage.getItem(key);
};

/**
 * Get the token for the currently active session
 * @returns {string|null} Active token or null
 */
export const getActiveToken = () => {
  const activeEmail = getActiveSessionEmail();
  if (!activeEmail) return null;
  return getTokenForUser(activeEmail);
};

/**
 * Store token and user info for a user
 * @param {string} email - User email
 * @param {string} token - JWT token
 * @param {object} userInfo - User information object
 */
export const storeUserSession = (email, token, userInfo) => {
  if (typeof window === 'undefined' || !email || !token) return;
  
  const sessionKey = getSessionKey(email);
  const userInfoKey = getUserInfoKey(email);
  
  localStorage.setItem(sessionKey, token);
  if (userInfo) {
    localStorage.setItem(userInfoKey, JSON.stringify(userInfo));
  }
  
  // Set as active session
  setActiveSession(email);
};

/**
 * Clear session for a specific user
 * @param {string} email - User email
 */
export const clearUserSession = (email) => {
  if (typeof window === 'undefined' || !email) return;
  
  const sessionKey = getSessionKey(email);
  const userInfoKey = getUserInfoKey(email);
  
  // Remove JWT token and user info
  localStorage.removeItem(sessionKey);
  localStorage.removeItem(userInfoKey);
  
  // Clear active session if this was the active one
  const activeEmail = getActiveSessionEmail();
  if (activeEmail && activeEmail.toLowerCase() === email.toLowerCase()) {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }
  
  // Also clean up legacy keys to prevent conflicts
  cleanupLegacyKeys();
};

/**
 * Clear all sessions (logout all users)
 */
export const clearAllSessions = () => {
  if (typeof window === 'undefined') return;
  
  // Get all session keys
  const keys = Object.keys(localStorage);
  const sessionKeys = keys.filter(key => 
    key.startsWith(SESSION_KEY_PREFIX) || 
    key.startsWith(USER_INFO_PREFIX) ||
    key === ACTIVE_SESSION_KEY
  );
  
  sessionKeys.forEach(key => localStorage.removeItem(key));
};

/**
 * Switch to a different user session
 * Clears the previous active session and sets the new one
 * @param {string} newEmail - New user email to switch to
 * @param {string} token - JWT token for new user
 * @param {object} userInfo - User information object
 */
export const switchToUserSession = (newEmail, token, userInfo) => {
  if (typeof window === 'undefined' || !newEmail || !token) return;
  
  // Get current active session
  const currentActiveEmail = getActiveSessionEmail();
  
  // If switching to a different user, clear the previous active session data
  // (but keep the session key in case they want to switch back)
  // Actually, let's clear all cart-related data for the previous user
  if (currentActiveEmail && currentActiveEmail.toLowerCase() !== newEmail.toLowerCase()) {
    // Clear cart data for previous user
    const cartKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(`weldpro-cart-${currentActiveEmail.toLowerCase()}`) ||
      key.startsWith('weldpro-cart-guest')
    );
    cartKeys.forEach(key => localStorage.removeItem(key));
    
    console.log(`Switching from ${currentActiveEmail} to ${newEmail}`);
  }
  
  // Store new session
  storeUserSession(newEmail, token, userInfo);
};

/**
 * Get user info for active session
 * @returns {object|null} User info or null
 */
export const getActiveUserInfo = () => {
  const activeEmail = getActiveSessionEmail();
  if (!activeEmail) return null;
  
  const userInfoKey = getUserInfoKey(activeEmail);
  const userInfoStr = localStorage.getItem(userInfoKey);
  
  if (!userInfoStr) return null;
  
  try {
    return JSON.parse(userInfoStr);
  } catch (e) {
    console.error('Error parsing user info:', e);
    return null;
  }
};

/**
 * Check if a user has an active session
 * @param {string} email - User email
 * @returns {boolean} True if session exists
 */
export const hasUserSession = (email) => {
  if (!email) return false;
  const token = getTokenForUser(email);
  return !!token;
};

/**
 * Get all active session emails (all logged-in users)
 * @returns {string[]} Array of user emails with active sessions
 */
export const getAllActiveSessions = () => {
  if (typeof window === 'undefined') return [];
  
  const keys = Object.keys(localStorage);
  const sessionKeys = keys.filter(key => key.startsWith(SESSION_KEY_PREFIX));
  
  return sessionKeys.map(key => {
    // Extract email from key: "token-email@example.com" -> "email@example.com"
    return key.substring(SESSION_KEY_PREFIX.length);
  });
};

/**
 * Clean up legacy localStorage keys that conflict with session management
 * Removes old 'token' and 'user' keys that are not email-specific
 */
export const cleanupLegacyKeys = () => {
  if (typeof window === 'undefined') return;
  
  // Remove legacy keys
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  console.log('Cleaned up legacy localStorage keys');
};

