import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: React.ReactNode;
  isAuthenticated: boolean;
}

export function ProtectedRoute({
  element,
  isAuthenticated,
}: ProtectedRouteProps) {
  return isAuthenticated ? <>{element}</> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
