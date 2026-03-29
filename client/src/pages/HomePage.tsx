import { useEffect, useState, useCallback } from "react";
import { GoogleMap, MarkerF, InfoWindowF } from "@react-google-maps/api";
import {
  Box,
  Typography,
  Chip,
  Fab,
  CircularProgress,
  Paper,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import { useMaps } from "../context/MapsContext";
import { getAllLocations, deleteMemory } from "../api/memories";
import { useToast } from "../context/ToastContext";
import { MemoryMarker } from "../types/shared";

const MAP_CENTER = { lat: 32.8802, lng: -117.2392 };
const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

const MOOD_COLORS: Record<string, string> = {
  Nostalgic: "#ff9d24",
  Travel: "#1be287",
  Food: "#ff247d",
  Music: "#2496ff",
  default: "#374869",
};

function getMoodMarkerIcon(mood: string): google.maps.Icon {
  const color = MOOD_COLORS[mood] ?? MOOD_COLORS["default"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path d="M14 0 C6.268 0 0 6.268 0 14 C0 24.5 14 40 14 40 C14 40 28 24.5 28 14 C28 6.268 21.732 0 14 0 Z"
      fill="${color}" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(28, 40),
    anchor: new window.google.maps.Point(14, 40),
  };
}

interface HomePageProps {
  onOpenCreate: () => void;
  onOpenEdit: (id: string) => void;
  refreshKey: number;
}

export default function HomePage({
  onOpenCreate,
  onOpenEdit,
  refreshKey,
}: HomePageProps) {
  const mapsCtx = useMaps();
  const isLoaded = mapsCtx.isLoaded;
  const noKey = !mapsCtx.isLoaded ? mapsCtx.noKey : undefined;
  const [markers, setMarkers] = useState<MemoryMarker[]>([]);
  const [activeMarker, setActiveMarker] = useState<MemoryMarker | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    getAllLocations().then(setMarkers).catch(console.error);
  }, [refreshKey]);

  const handleDelete = useCallback(async () => {
    if (!confirmDeleteId) return;
    await deleteMemory(confirmDeleteId);
    setMarkers((prev) => prev.filter((m) => m._id !== confirmDeleteId));
    setActiveMarker(null);
    setConfirmDeleteId(null);
    showToast("Memory deleted", "success");
  }, [confirmDeleteId, showToast]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />

      <Box
        component="main"
        sx={{ flexGrow: 1, position: "relative", overflow: "hidden" }}
      >
        {noKey && (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">
              Set <code>GOOGLE_MAPS_API_KEY</code> in <code>server/.env</code>{" "}
              to enable the map.
            </Typography>
          </Box>
        )}

        {!isLoaded && !noKey && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={MAP_CENTER}
            zoom={10}
            options={MAP_OPTIONS}
          >
            {markers.map((m) => (
              <MarkerF
                key={m._id}
                position={{ lat: m.latitude, lng: m.longitude }}
                title={m.title}
                icon={getMoodMarkerIcon(m.mood)}
                onClick={() => setActiveMarker(m)}
              />
            ))}

            {activeMarker && (
              <InfoWindowF
                position={{
                  lat: activeMarker.latitude,
                  lng: activeMarker.longitude,
                }}
                onCloseClick={() => setActiveMarker(null)}
                options={{
                  pixelOffset: new window.google.maps.Size(0, -38),
                }}
              >
                <Paper elevation={0} sx={{ p: 0.5, minWidth: 160 }}>
                  <Chip
                    label={activeMarker.mood}
                    size="small"
                    sx={{
                      bgcolor:
                        MOOD_COLORS[activeMarker.mood] ?? MOOD_COLORS["default"],
                      color: "#fff",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 0.5 }}
                  >
                    {activeMarker.title}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setActiveMarker(null);
                        onOpenEdit(activeMarker._id);
                      }}
                    >
                      <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setConfirmDeleteId(activeMarker._id)}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </Paper>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}

        <Fab
          color="primary"
          aria-label="Add memory"
          onClick={onOpenCreate}
          sx={{ position: "absolute", bottom: 24, right: 24 }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {confirmDeleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this memory?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </Box>
  );
}
