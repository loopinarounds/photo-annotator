import { jwtDecode } from "jwt-decode";

export function isLoggedIn(): boolean {
  const token = localStorage.getItem("token");

  if (token) {
    const isValid = isTokenValid(token);
    if (isValid) return true;
  }

  return false;
}

const isTokenValid = (token: string) => {
  if (!token) return false;

  const decoded = jwtDecode(token);
  const currentTime = Date.now() / 1000; // in seconds

  if (!decoded.exp) return false;

  return decoded.exp > currentTime;
};
