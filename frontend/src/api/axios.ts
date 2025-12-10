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

//interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
        config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
},(error) => {
    return Promise.reject(error);
});

export default api;