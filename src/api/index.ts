import { isLoggedIn } from "../auth";

const API_BASE_URL = "http://localhost:3000"; // Can be changed to the deployed API URL

export async function publicApiRequest<T>(
  endpoint: string,
  {
    method = "GET",
    body = null,
  }: {
    method?: string;
    body?: Record<string, unknown> | null;
    token?: string | null;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_BASE_URL}/public${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  return await response.json();
}

export async function privateApiRequest<T>(
  endpoint: string,
  {
    method = "GET",
    body = null,
    token = localStorage.getItem("token"),
  }: {
    method?: string;
    body?: Record<string, unknown> | null;
    token?: string | null;
  } = {}
): Promise<T> {
  if (!token) {
    throw new Error("No token found");
  }

  const isValid = isLoggedIn();

  if (!isValid) {
    throw new Error("Token is invalid");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  return await response.json();
}
