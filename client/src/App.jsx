import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { MapsProvider } from "./context/MapsContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import MemoriesPage from "./pages/MemoriesPage.jsx";
import CreatePage from "./pages/CreatePage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <MapsProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/create/:id" element={<CreatePage />} />
        </Route>

        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </MapsProvider>
    </AuthProvider>
  );
}
