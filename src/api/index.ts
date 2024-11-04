const API_BASE_URL = "http://localhost:3000"; // Can be changed to the deployed API URL

export async function apiRequest(
  endpoint: string,
  {
    method = "GET",
    body = null,
    token = null,
  }: {
    method?: string;
    body?: Record<string, unknown> | null;
    token?: string | null;
  } = {}
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  return await response.json();
}
