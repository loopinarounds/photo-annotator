import React, { memo } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./SideBar";
import Loading from "./Loading";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  element: React.ReactNode;
}

export const ProtectedRoute = memo(function ProtectedRoute({
  element,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-grow overflow-y-auto p-6">{element}</div>
    </div>
  );
});

export default ProtectedRoute;
