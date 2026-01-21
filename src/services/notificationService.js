import axios from "axios";
import { getAuthHeaders } from "../utils/authHelper";

const API_BASE = "http://localhost:8080/api/notifications";

export const getUserNotifications = async () => {
  try {
    const response = await axios.get(`${API_BASE}/user`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user notifications:", error);
    throw error;
  }
};

export const getAdminNotifications = async () => {
  try {
    const response = await axios.get(`${API_BASE}/admin`, getAuthHeaders());
    return response.data;
  } catch (error) {
    // Silently handle 403 errors (user not admin or token doesn't have admin role)
    if (error.response?.status === 403) {
      // Only log once, not repeatedly
      if (!getAdminNotifications._logged403) {
        console.warn("Admin notifications: Access denied. User may need to log out and log back in to refresh token.");
        getAdminNotifications._logged403 = true;
        setTimeout(() => { getAdminNotifications._logged403 = false; }, 60000); // Reset after 1 minute
      }
      return []; // Return empty array for non-admin users
    }
    const errorMessage = error.response?.data || error.message;
    console.error("Failed to fetch admin notifications:", errorMessage);
    throw error;
  }
};

export const getUserUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_BASE}/user/unread-count`, getAuthHeaders());
    return response.data.count || 0;
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    return 0;
  }
};

export const getAdminUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_BASE}/admin/unread-count`, getAuthHeaders());
    return response.data.count || 0;
  } catch (error) {
    // Silently handle 403 errors (user not admin or token doesn't have admin role)
    if (error.response?.status === 403) {
      // Don't log repeatedly - already logged in getAdminNotifications
      return 0; // Return 0 for non-admin users
    }
    const errorMessage = error.response?.data || error.message;
    console.error("Failed to fetch admin unread count:", errorMessage);
    return 0;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`${API_BASE}/${notificationId}/read`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
};

export const markAllAsReadForUser = async () => {
  try {
    const response = await axios.put(`${API_BASE}/user/mark-all-read`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Failed to mark all as read:", error);
    throw error;
  }
};

export const markAllAsReadForAdmin = async () => {
  try {
    const response = await axios.put(`${API_BASE}/admin/mark-all-read`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Failed to mark all as read:", error);
    throw error;
  }
};



export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`${API_BASE}/${notificationId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Failed to delete notification:", error);
    throw error;
  }
};

export const deleteAllUserNotifications = async () => {
  try {
    const response = await axios.delete(`${API_BASE}/user/delete-all`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Failed to delete all notifications:", error);
    throw error;
  }
};

export const deleteAllAdminNotifications = async () => {
  try {
    const response = await axios.delete(`${API_BASE}/admin/delete-all`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Failed to delete all notifications:", error);
    throw error;
  }
};


