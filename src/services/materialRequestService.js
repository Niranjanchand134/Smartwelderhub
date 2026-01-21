// services/materialRequestService.js
import { getAuthToken } from '../utils/authHelper';

const API_BASE_URL = 'http://localhost:8080/api/material-requests';

const getHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const createMaterialRequest = async (requestData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create material request');
  }

  return response.json();
};

export const getAllMaterialRequests = async () => {
  const response = await fetch(API_BASE_URL, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch material requests');
  }

  return response.json();
};

export const getMaterialRequestsByStatus = async (status) => {
  const response = await fetch(`${API_BASE_URL}/status/${status}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch material requests');
  }

  return response.json();
};

export const getMaterialRequestsByWelderId = async (welderId) => {
  const response = await fetch(`${API_BASE_URL}/welder/${welderId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch material requests');
  }

  return response.json();
};

export const getMaterialRequestsByWelderIdAndStatus = async (welderId, status) => {
  const response = await fetch(`${API_BASE_URL}/welder/${welderId}/status/${status}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch material requests');
  }

  return response.json();
};

export const getMaterialRequestById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch material request');
  }

  return response.json();
};

export const approveMaterialRequest = async (id, adminNotes = null) => {
  const response = await fetch(`${API_BASE_URL}/${id}/approve`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ adminNotes }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to approve material request');
  }

  return response.json();
};

export const rejectMaterialRequest = async (id, rejectionReason = null) => {
  const response = await fetch(`${API_BASE_URL}/${id}/reject`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ rejectionReason }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to reject material request');
  }

  return response.json();
};

export const fulfillMaterialRequest = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}/fulfill`, {
    method: 'PUT',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fulfill material request');
  }

  return response.json();
};

export const updateMaterialRequest = async (id, requestData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update material request');
  }

  return response.json();
};

export const deleteMaterialRequest = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to delete material request');
  }

  return response.json();
};

