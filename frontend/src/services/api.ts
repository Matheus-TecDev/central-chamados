export const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  return localStorage.getItem("central_chamados_token");
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem("central_chamados_token", token);
    return;
  }
  localStorage.removeItem("central_chamados_token");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = getApiErrorMessage(body);
    console.error("API request failed", { path, status: response.status, message, details: body });
    throw new ApiError(message, response.status, body?.error?.details ?? body?.detail);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

function getApiErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "Erro ao comunicar com a API.";
  }
  const payload = body as { error?: { message?: unknown }; detail?: unknown };
  if (typeof payload.error?.message === "string") {
    return payload.error.message;
  }
  if (typeof payload.detail === "string") {
    return payload.detail;
  }
  if (Array.isArray(payload.detail) && payload.detail.length) {
    return "Erro de validacao dos dados enviados.";
  }
  return "Erro ao comunicar com a API.";
}
