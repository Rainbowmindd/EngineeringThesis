import axios from "axios";

// Wybierz URL na podstawie środowiska
const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL_DEV
  : import.meta.env.VITE_API_URL_PROD;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// interceptor
api.interceptors.request.use(
  (config) => {
    const url = config.url ?? "";

    const isPublicEndpoint =
      url.includes("/api/users/register/") ||
      url.includes("/api/users/login/") ||
      url.includes("/api/users/token/refresh/");

    if (isPublicEndpoint) {
      if (config.headers?.Authorization) {
        delete config.headers.Authorization;
      }
      return config;
    }

    const token = localStorage.getItem("authToken");

    if (token && token !== "null" && token !== "undefined") {
      config.headers = config.headers ?? {};
      config.headers.Authorization = "Bearer " + token;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;