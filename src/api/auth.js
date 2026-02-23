import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

export const loginUser = async (email, password) => {
  try {
    const response = await API.post("/users/token/", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const registerUser = async (formData) => {
  try {
    const payload = {
      email: formData.email,
      full_name: formData.fullname,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      phone_number: formData.phonenumber,
      password: formData.password,
    };
    const response = await API.post("/users/users/register/", payload);
    return response.data;
  } catch (error) {
    const data = error.response?.data;
    throw data || { message: "Registration failed" };
  }
};