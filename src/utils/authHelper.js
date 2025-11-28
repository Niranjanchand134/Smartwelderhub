/**
 * Authentication Helper Utility
 * 
 * Provides helper functions for services to get authentication tokens
 * Uses session manager to get the currently active session token
 */

import { getActiveToken } from './sessionManager';

/**
 * Get the currently active authentication token
 * This should be used by all services instead of directly accessing localStorage
 * @returns {string|null} Active JWT token or null
 */
export const getAuthToken = () => {
  return getActiveToken();
};

/**
 * Get authorization headers with the active token
 * @returns {object} Headers object with Authorization and Content-Type
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return { headers };
};

