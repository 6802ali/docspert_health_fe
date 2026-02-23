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

export const getConsultations = async (page = 1, pageSize = 10) => {
  try {
    const response = await API.get("/consultations/", {
      params: {
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch consultations" };
  }
};

export const createConsultation = async (consultationData) => {
  try {
    const response = await API.post("/consultations/", consultationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create consultation" };
  }
};

export const generateSummary = async (id) => {
  try {
    const response = await API.post(`/consultations/${id}/generate-summary/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to generate AI summary" };
  }
};
