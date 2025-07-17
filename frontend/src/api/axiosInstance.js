// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = (token) =>
  axios.create({
    baseURL: "http://localhost:4000/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export default axiosInstance;
