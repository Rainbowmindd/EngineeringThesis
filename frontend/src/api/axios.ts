import axios from "axios";

const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL_DEV
  : import.meta.env.VITE_API_URL_PROD;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 🔥 KLUCZOWY INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      if (config.headers?.["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    } else {
      config.headers = config.headers ?? {};
      config.headers["Content-Type"] = "application/json";
    }

    const url = config.url ?? "";

    const isPublicEndpoint =
      url.includes("/api/users/register/") ||
      url.includes("/api/users/login/") ||
      url.includes("/api/users/token/refresh/");

    if (isPublicEndpoint) {
      delete config.headers?.Authorization;
      return config;
    }

    const token = localStorage.getItem("authToken");

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = "Bearer " + token;
    } else {
      delete config.headers?.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
