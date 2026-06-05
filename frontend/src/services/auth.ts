import { api, setToken } from "./api";
import { User } from "../types/domain";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export async function login(email: string, password: string): Promise<User> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);
  const response = await api<LoginResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  setToken(response.access_token);
  return response.user;
}

export async function me(): Promise<User> {
  return api<User>("/auth/me");
}
