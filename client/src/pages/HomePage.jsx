import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, MarkerF, InfoWindowF } from "@react-google-maps/api";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Spinner from "../components/Spinner.jsx";
import { useMaps } from "../context/MapsContext.jsx";
import { getAllLocations, getAllMemories, deleteMemory } from "../api/memories.js";
import styles from "./HomePage.module.css";

const MAP_CENTER = { lat: 32.8802, lng: -117.2392 };
const MAP_OPTIONS = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

const MOOD_COLORS = {
  Nostalgic: "#ff9d24",
  Travel: "#1be287",
  Food: "#ff247d",
  Music: "#2496ff",
  default: "#374869",
};

function getMoodMarkerIcon(mood) {
  const color = MOOD_COLORS[mood] ?? MOOD_COLORS.default;
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

export default function HomePage() {
  const { isLoaded, noKey } = useMaps();
  const [markers, setMarkers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memories, setMemories] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllLocations().then(setMarkers).catch(console.error);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      getAllMemories().then(setMemories).catch(console.error);
    }
  }, [sidebarOpen]);

  const handleDelete = useCallback(async (id) => {
    await deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m._id !== id));
    setMarkers((prev) => prev.filter((m) => m._id !== id));
  }, []);

  const handleEdit = useCallback((id) => navigate(`/create/${id}`), [navigate]);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {noKey && (
          <p className={styles.info}>
            Set <code>GOOGLE_MAPS_API_KEY</code> in <code>server/.env</code> to
            enable the map.
          </p>
        )}

        {!isLoaded && !noKey && <Spinner />}

        {isLoaded && (
          <GoogleMap
            mapContainerClassName={styles.map}
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
                position={{ lat: activeMarker.latitude, lng: activeMarker.longitude }}
                onCloseClick={() => setActiveMarker(null)}
                options={{ pixelOffset: new window.google.maps.Size(0, -38) }}
              >
                <div className={styles.infoWindow}>
                  <span
                    className={styles.infoWindowBadge}
                    style={{
                      backgroundColor:
                        MOOD_COLORS[activeMarker.mood] ?? MOOD_COLORS.default,
                    }}
                  >
                    {activeMarker.mood}
                  </span>
                  <p className={styles.infoWindowTitle}>{activeMarker.title}</p>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}

        <button
          className={styles.openSidebarBtn}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open memories sidebar"
        >
          Memories
        </button>
      </main>

      <Sidebar
        memories={memories}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
