import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { AuthProvider } from "./context/AuthContext";
import { MapsProvider } from "./context/MapsContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import CreateMemoryModal from "./components/CreateMemoryModal";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import MemoriesPage from "./pages/MemoriesPage";
import theme from "./theme";

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editMemoryId, setEditMemoryId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function openCreate() {
    setEditMemoryId(null);
    setModalOpen(true);
  }

  function openEdit(id: string) {
    setEditMemoryId(id);
    setModalOpen(true);
  }

  function handleModalClose(saved: boolean) {
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
