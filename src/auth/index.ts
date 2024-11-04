export function isLoggedIn(): boolean {
  const token = localStorage.getItem("authToken");

  if (token) {
    // TODO: Check if the token is valid by decoding and checking expiration

    return true;
  }

  return false;
}
