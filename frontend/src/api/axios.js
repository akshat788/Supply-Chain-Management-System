import axios from "axios";

const API = axios.create({
  baseURL: "http://172.16.0.47:5000/api",
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;