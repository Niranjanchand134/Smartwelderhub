import axios from "axios";
import { getAuthHeaders } from "../utils/authHelper";

const API_BASE = "http://localhost:8080/api/custom-orders";

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

export const createCustomOrder = async (payload) => {
  try {
    const response = await axios.post(API_BASE, payload, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getAllCustomOrders = async () => {
  try {
    const response = await axios.get(API_BASE, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCustomOrdersByStatus = async (status) => {
  try {
    const response = await axios.get(`${API_BASE}/status/${status}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCustomOrderById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const approveCustomOrder = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/approve`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const rejectCustomOrder = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/reject`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateCustomOrder = async (id, payload) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, payload, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteCustomOrder = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const cancelCustomOrder = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/cancel`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateOrderProgress = async (id, progressPercentage) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/progress`, { progressPercentage }, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const startOrder = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/start`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const markAsReadyForDelivery = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/ready`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const markAsCompleted = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/complete`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const uploadCompletionPhotos = async (id, photoUrls) => {
  try {
    const response = await axios.post(`${API_BASE}/${id}/completion-photos`, photoUrls, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const customerConfirm = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/customer-confirm`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const customerRaiseIssue = async (id, issueDescription) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/raise-issue`, { issueDescription }, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const adminVerifyAndClose = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/admin-verify`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const addWelderNotes = async (id, notes) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/welder-notes`, { notes }, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const addReviewAndRating = async (id, rating, reviewComment) => {
  try {
    const response = await axios.post(`${API_BASE}/${id}/review`, { rating, reviewComment }, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updatePaymentInfo = async (id, paymentMethod, additionalCharges) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/payment-info`, { paymentMethod, additionalCharges }, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/payment-status`, { paymentStatus }, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const resolveIssue = async (id, resolutionNotes) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}/resolve-issue`, { resolutionNotes }, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getAllWelders = async () => {
  try {
    const response = await axios.get(`${API_BASE}/welders`, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const assignWeldersToOrder = async (orderId, welderIds) => {
  try {
    const response = await axios.put(`${API_BASE}/${orderId}/assign-welders`, { welderIds }, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getOrdersByWelder = async (welderId) => {
  try {
    const response = await axios.get(`${API_BASE}/welder/${welderId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

