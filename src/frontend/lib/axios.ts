import axios from "axios";

const api = axios.create({
  // Đặt URL của Backend Flask vào đây
  baseURL: process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
