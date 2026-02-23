import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized - redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("email");
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getPatients = async (page = 1, pageSize = 10) => {
  try {
    const response = await API.get("/patients/", {
      params: {
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch patients" };
  }
};

export const createPatient = async (patientData) => {
  try {
    const response = await API.post("/patients/", patientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create patient" };
  }
};

export const getAllPatients = async () => {
  try {
    const response = await API.get("/patients/", {
      params: {
        page_size: 1000, // Get all patients for dropdown
      },
    });
    // Handle different API response formats
    if (response.data.results) {
      return response.data.results;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch patients" };
  }
};
