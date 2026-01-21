import axios from "axios";
import { getAuthHeaders } from "../utils/authHelper";

const API_BASE = "http://localhost:8080/api/delivery";
const ORDER_BASE = "http://localhost:8080/api/orders";

const handleError = (error) => {
  if (error.response && error.response.data) {
    const errorData = error.response.data;
    if (typeof errorData === 'string') {
      throw new Error(errorData);
    } else if (errorData.message) {
      throw new Error(errorData.message);
    } else {
      throw new Error(JSON.stringify(errorData));
    }
  } else if (error.message) {
    throw new Error(error.message);
  } else {
    throw new Error("An error occurred. Please try again.");
  }
};

export const saveDeliveryInfo = async (payload) => {
  try {
    const response = await axios.post(API_BASE, payload, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(typeof error.response.data === 'string' ? error.response.data : error.response.data.message || 'Failed to save delivery info');
    } else {
      throw new Error("Failed to save delivery info. Please try again.");
    }
  }
};

export const getAllDeliveryInfo = async () => {
  try {
    const response = await axios.get(API_BASE, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(typeof error.response.data === 'string' ? error.response.data : error.response.data.message || 'Failed to fetch delivery info');
    } else {
      throw new Error("Failed to fetch delivery info. Please try again.");
    }
  }
};

export const createOrder = async (payload) => {
  try {
    const response = await axios.post(ORDER_BASE, payload, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(typeof error.response.data === 'string' ? error.response.data : error.response.data.message || 'Failed to create order');
    } else {
      throw new Error("Failed to create order. Please try again.");
    }
  }
};

export const getAllOrders = async () => {
  try {
    const response = await axios.get(ORDER_BASE, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(typeof error.response.data === 'string' ? error.response.data : error.response.data.message || 'Failed to fetch orders');
    } else {
      throw new Error("Failed to fetch orders. Please try again.");
    }
  }
};

export const getSavedDeliveryAddresses = async () => {
  try {
    const response = await axios.get(`${API_BASE}/saved`, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error(JSON.stringify(errorData));
      }
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to fetch saved addresses. Please try again.");
    }
  }
};

export const updateDeliveryInfo = async (id, payload) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, payload, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error(JSON.stringify(errorData));
      }
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to update delivery info. Please try again.");
    }
  }
};

export const deleteDeliveryInfo = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    // Handle 409 Conflict (address has associated orders)
    if (error.response && error.response.status === 409) {
      const errorData = error.response.data;
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error('Cannot delete address: This address is associated with existing orders. Please delete or update the orders first.');
      }
    }
    
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error(JSON.stringify(errorData));
      }
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to delete delivery info. Please try again.");
    }
  }
};


