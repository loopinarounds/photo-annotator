import React from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./SideBar";

interface ProtectedRouteProps {
  element: React.ReactNode;
  isAuthenticated: boolean;
}

export function ProtectedRoute({
  element,
  isAuthenticated,
}: ProtectedRouteProps) {
  return isAuthenticated ? (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-grow">{element}</div>
      </div>
    </>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default ProtectedRoute;
