import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/", //for backend connection
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