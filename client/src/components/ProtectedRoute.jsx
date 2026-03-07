import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { user } = useAuth();

  // Still loading auth state — render nothing to avoid flash
  if (user === undefined) {
    return null;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
