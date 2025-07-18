// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = (token) =>
  axios.create({
    baseURL: "https://ghumakad-web-application.onrender.com/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export default axiosInstance;
