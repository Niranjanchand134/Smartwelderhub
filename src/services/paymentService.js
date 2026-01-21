import axios from "axios";
import { getAuthHeaders } from "../utils/authHelper";

const API_BASE = "http://localhost:8080/api";

const handleError = (error) => {
  if (error.response && error.response.data) {
    throw new Error(error.response.data);
  } else {
    throw new Error("An error occurred. Please try again.");
  }
};

export const initiateEsewaPayment = async (orderData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/payment/esewa/initiate`,
      orderData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const verifyEsewaPayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/payment/esewa/verify`,
      paymentData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};



export const checkEsewaStatus = async (statusData) => {
  try {
    const { productCode, transactionUuid, totalAmount } = statusData;
    const response = await axios.get(
      `${API_BASE}/payment/esewa/status`,
      {
        params: {
          product_code: productCode,
          transaction_uuid: transactionUuid,
          total_amount: totalAmount,
        },
        ...getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

