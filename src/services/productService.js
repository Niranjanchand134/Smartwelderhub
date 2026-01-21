import axios from "axios";
import { getAuthHeaders } from "../utils/authHelper";

const API_BASE = "http://localhost:8080/api/products";

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(API_BASE, productData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getAllProducts = async () => {
  try {
    const response = await axios.get(API_BASE);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, productData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteProduct = async (id) => {
  try {
    await axios.delete(`${API_BASE}/${id}`);
  } catch (error) {
    handleError(error);
  }
};

export const addProductReview = async (productId, rating, comment) => {
  try {
    const response = await axios.post(
      `${API_BASE}/${productId}/reviews`,
      { rating, comment },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getProductReviews = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE}/${productId}/reviews`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error) => {
  if (error.response && error.response.data) {
    throw new Error(error.response.data);
  } else {
    throw new Error("An error occurred. Please try again.");
  }
};

