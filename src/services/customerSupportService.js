import axios from "axios";
import { getAuthToken, getAuthHeaders } from "../utils/authHelper";

const API_BASE_URL = "http://localhost:8080";

// Send a message to customer support
export const sendSupportMessage = async (message) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/api/customer-support/send`,
      { message },
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

// Get customer support conversation
export const getSupportConversation = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/api/customer-support/conversation`,
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

