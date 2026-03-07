import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { AuthProvider } from "./context/AuthContext.jsx";
import { MapsProvider } from "./context/MapsContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Toast from "./components/Toast.jsx";
import CreateMemoryModal from "./components/CreateMemoryModal.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import MemoriesPage from "./pages/MemoriesPage.jsx";
import theme from "./theme.js";

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editMemoryId, setEditMemoryId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function openCreate() {
    setEditMemoryId(null);
    setModalOpen(true);
  }

  function openEdit(id) {
    setEditMemoryId(id);
    setModalOpen(true);
  }

  function handleModalClose(saved) {
    setModalOpen(false);
    setEditMemoryId(null);
    if (saved) setRefreshKey((k) => k + 1);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Lift Google Places dropdown above MUI Dialog (z-index 1300) */}
      <GlobalStyles styles={{ ".pac-container": { zIndex: 1400 } }} />
      <AuthProvider>
        <MapsProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route
                  path="/"
                  element={
                    <HomePage
                      onOpenCreate={openCreate}
                      onOpenEdit={openEdit}
                      refreshKey={refreshKey}
                    />
                  }
                />
                <Route
                  path="/memories"
                  element={
                    <MemoriesPage
                      onOpenCreate={openCreate}
                      onOpenEdit={openEdit}
                      refreshKey={refreshKey}
                    />
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <CreateMemoryModal
              open={modalOpen}
              onClose={handleModalClose}
              memoryId={editMemoryId}
            />
            <Toast />
          </ToastProvider>
        </MapsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
