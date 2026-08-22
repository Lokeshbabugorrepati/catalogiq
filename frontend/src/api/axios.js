import axios from "axios";

// Falls back to localhost for local dev; set VITE_API_URL in production (e.g. your Render backend URL)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export default api;
