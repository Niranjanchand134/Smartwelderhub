
import axios from "axios";
import { ErrorMessageToast } from "../utils/Tostify.util";
import { getAuthToken, getAuthHeaders } from "../utils/authHelper";

  export const loginDetails = async (email, password) =>{

    try{
      const response = await axios.post("http://localhost:8080/userLogin", {email, password});

      return response.data;
    }
    catch(error){
      if(error.response && error.response.data){
        console.log(error.response.data);
        throw new Error(error.response.data);
      }
      else{
        throw new Error("Login failed. Please try later.")
      }
    }
    
  }

export const UserRegister = async (data) => {
  try {
    const response = await axios.post("http://localhost:8080/registers", data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      // Forward error message to caller
      console.log(error.response.data);
      throw new Error(error.response.data);
    } else {
      throw new Error("Registration failed. Please try again.");
    }
  }
};

export const greeting = async () => {
  const response = await axios.get("http://localhost:8080/");

  console.log(response);

  return response.data;
};

export const checkAuth = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No active session");
  }
  
  try {
    const response = await axios.get("http://localhost:8080/test-auth", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; // Return the successful response
  } catch (error) {
    if (error.response) {
      console.error(
        "Server responded with:",
        error.response.status,
        error.response.data
      );
      throw new Error(error.response.data?.message || "Unauthorized");
    }
    throw error; // Re-throw other errors
  }
};

export const CheckEmail = async ({email})=>{
  const response = await axios.post(`http://localhost:8080/api/checkEmail`, {email});
  console.log(response)
  return response;
}

export const CheckOtp = async ({ email, otp }) => {
  const response = await axios.post("http://localhost:8080/api/checkOTP", {
    email,
    otp
  });
  return response.data;
};

export const UpdatePassword = async ({ email, password }) => {
  const response = await axios.post(
    `http://localhost:8080/api/updatePassword`,
    {
      email, password
    }
  );
  console.log(response);
  return response;
};

export const getUserDetailsById = async (id)=>{
  try {
    const authHeaders = getAuthHeaders();
    const response = await axios.post(
      `http://localhost:8080/api/user/getUserDetailsById/${id}`,
      {},
      authHeaders
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error("You are not authorized to view this profile");
      }
      if (error.response.data) {
        throw new Error(typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
      }
    }
    throw new Error("Failed to fetch user details");
  }
}

export const updateUserProfile = async (id, profileData) => {
  try {
    const authHeaders = getAuthHeaders();
    const response = await axios.put(
      `http://localhost:8080/api/user/updateProfile/${id}`,
      profileData,
      authHeaders
    );
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error("You are not authorized to update this profile");
      }
      if (error.response.data) {
        throw new Error(typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
      }
    }
    throw new Error("Failed to update profile");
  }
}

export const getAllUsers = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get("http://localhost:8080/api/users", headers);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log(error.response.data);
      const errorMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : error.response.data.message || JSON.stringify(error.response.data);
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to fetch users. Please try again.");
    }
  }
};

export const updateUser = async (id, data) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(`http://localhost:8080/api/admin/users/${id}`, data, headers);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const errorMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : error.response.data.message || JSON.stringify(error.response.data);
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to update user.");
    }
  }
};

export const deleteUser = async (id) => {
  try {
    const headers = getAuthHeaders();
    await axios.delete(`http://localhost:8080/api/admin/users/${id}`, headers);
  } catch (error) {
    if (error.response && error.response.data) {
      const errorMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : error.response.data.message || JSON.stringify(error.response.data);
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to delete user.");
    }
  }
};

export const createWelder = async (welderData) => {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/admin-setup/create-welder",
      welderData
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const errorMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : error.response.data.message || JSON.stringify(error.response.data);
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to create welder. Please try again.");
    }
  }
};