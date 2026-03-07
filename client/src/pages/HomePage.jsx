import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useMaps } from "../context/MapsContext.jsx";
import { getAllLocations, getAllMemories, deleteMemory } from "../api/memories.js";
import styles from "./HomePage.module.css";

const MAP_CENTER = { lat: 32.8802, lng: -117.2392 };
const MAP_OPTIONS = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

export default function HomePage() {
  const { isLoaded, noKey } = useMaps();
  const [markers, setMarkers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memories, setMemories] = useState([]);
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

        {!isLoaded && !noKey && (
          <p className={styles.loading}>Loading map…</p>
        )}

        {isLoaded && (
          <GoogleMap
            mapContainerClassName={styles.map}
            center={MAP_CENTER}
            zoom={10}
            options={MAP_OPTIONS}
          >
            {markers.map((m, i) => (
              <MarkerF
                key={i}
                position={{ lat: m.latitude, lng: m.longitude }}
                title={m.title}
              />
            ))}
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

      {sidebarOpen && (
        <Sidebar
          memories={memories}
          onClose={() => setSidebarOpen(false)}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
