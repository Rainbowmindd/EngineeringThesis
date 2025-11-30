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
  const response = await api.post("api/users/register/", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await api.post("api/users/login/", data, {
    withCredentials: true,
  });
  return response.data;
};

export const logoout = async () => {
  const response = await api.post("api/users/logout/");
  return response.data;
};

export const fetchUserProfile = async () => {
  const response = await api.get("api/users/me/");
  return response.data;
};
