import axios from "axios";

const api = axios.create({
  baseURL: "https://connecto-z1wn.onrender.com//api",
  withCredentials: true,
});

// Automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vibetalk_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
