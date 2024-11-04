export function isLoggedIn(): boolean {
  const userId = localStorage.getItem("userId");
  return !!userId;
}
