// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = (token) =>
  axios.create({
    baseURL: "https://travel-booking-product.vercel.app/api",
  // baseURL: "http://localhost:4000/api",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export default axiosInstance;
