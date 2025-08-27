const API_BASE_URL = "http://localhost:3000"

export async function request<T>(
  endpoint: string,
  {
    method = "GET",
    body = null,
  }: {
    method?: string;
    body?: Record<string, unknown> | null | FormData;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = {};

  const requestBody = !body
    ? null
    : body instanceof FormData
    ? body
    : JSON.stringify(body);

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method,
    headers,
    body: requestBody,
    credentials: "include",
  });

  return await response.json();
}
