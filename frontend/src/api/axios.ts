import axios from "axios";

const api = axios.create({
    baseURL: "https://127.0.0.1.8000/", //for backend connection
    headers: { 
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export default api;