import api from "./axios";

export interface RegisterData {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  const response = await api.post("auth/registration/", data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await api.post("auth/login", data);
  return response.data;
};

export const logoout = async () => {
  const response = await api.post("auth/logout/");
  return response.data;
};
