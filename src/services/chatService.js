import axios from "axios";
import { getAuthToken, getAuthHeaders } from "../utils/authHelper";

const API_BASE_URL = "http://localhost:8080";

// Send a message (text only)
export const sendMessage = async (receiverId, message) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/api/chat/send`,
      { receiverId, message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    }
    throw new Error("Failed to send message. Please try again.");
  }
};

// Send a message with image
export const sendMessageWithImage = async (receiverId, message, imageFile) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("receiverId", receiverId);
    if (message) {
      formData.append("message", message);
    }
    formData.append("image", imageFile);

    const response = await axios.post(
      `${API_BASE_URL}/api/chat/send-with-image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    }
    throw new Error("Failed to send message with image. Please try again.");
  }
};

// Get conversations for welder
export const getWelderConversations = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/api/chat/welder/conversations`,
      headers
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    }
    throw new Error("Failed to fetch conversations. Please try again.");
  }
};

// Get conversation messages between welder and a specific user
export const getWelderConversation = async (userId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/api/chat/welder/conversation/${userId}`,
      headers
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    }
    throw new Error("Failed to fetch conversation. Please try again.");
  }
};

// Get conversations for user (with welder)
export const getUserConversations = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/chat/user/conversations`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('getUserConversations error:', error);
    if (error.response) {
      const errorMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : error.response.data?.message || JSON.stringify(error.response.data);
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("Network error. Please check your connection.");
    }
    throw new Error(error.message || "Failed to fetch conversations. Please try again.");
  }
};

// Get unread message count
export const getUnreadCount = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/api/chat/unread-count`,
      headers
    );
    return response.data.count;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    }
    throw new Error("Failed to fetch unread count. Please try again.");
  }
};

// Mark messages as read
export const markMessagesAsRead = async (otherUserId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/api/chat/mark-read/${otherUserId}`,
      {},
      headers
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    }
    throw new Error("Failed to mark messages as read. Please try again.");
  }
};

