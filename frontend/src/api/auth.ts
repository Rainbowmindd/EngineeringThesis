import api from "./axios";

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password1: string;
  password2: string;
  role: "student" | "lecturer";
}

export interface LoginData {
  username: string;
  password: string;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "student" | "lecturer";
}

export const register = async (data: RegisterData) => {
  //mapowanie kluczy dla DRF
  const payload = {
    username: data.username,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    password: data.password1,
    password2: data.password2,
    role: data.role,
  }
  const response = await api.post("/api/auth/registration/", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post("/api/auth/login/", {
    email,
    password
  });

  // dj-rest-auth + JWT zwraca cookies, więc jeśli chcesz token w JS:
  const accessToken = response.data.access_token || response.data.access;
  if (accessToken) {
    localStorage.setItem("authToken", accessToken);
  }

  return response.data;
};


export const logoout = async () => {
  const response = await api.post("/api/auth/logout/");
  localStorage.removeItem("authToken");
  return response.data;
};


export const fetchUserProfile = async () => {
  const token = localStorage.getItem("authToken");
  const response = await api.get("/api/users/me/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};


