import axios from "axios";

// const API = import.meta.env.VITE_API_URL;
const api = axios.create({
    // baseURL: "http://localhost:8000/", //for backend connection
    baseURL: "https://djangopracadyplomowa.azurewebsites.net/",
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