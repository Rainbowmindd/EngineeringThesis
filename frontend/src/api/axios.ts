import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/", //for backend connection
    headers: { 
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export default api;