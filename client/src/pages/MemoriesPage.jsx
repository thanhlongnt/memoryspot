import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import MemoryGrid from "../components/MemoryGrid.jsx";
import Spinner from "../components/Spinner.jsx";
import { getAllMemories, deleteMemory } from "../api/memories.js";
import { useToast } from "../context/ToastContext.jsx";
import styles from "./MemoriesPage.module.css";

const MOODS = ["All Moods", "Nostalgic", "Travel", "Food", "Music"];

const MOOD_COLORS = {
  Nostalgic: "#ff9d24",
  Travel: "#1be287",
  Food: "#ff247d",
  Music: "#2496ff",
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState([]);
  const [mood, setMood] = useState("All Moods");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const load = useCallback(async (selectedMood) => {
    setLoading(true);
    try {
      const filter = selectedMood === "All Moods" ? undefined : selectedMood;
      const data = await getAllMemories(filter);
      setMemories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(mood);
  }, [mood, load]);

  const handleDelete = useCallback(
    async (id) => {
      await deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m._id !== id));
      showToast("Memory deleted", "success");
    },
    [showToast]
  );

  const handleEdit = useCallback(
    (id) => navigate(`/create/${id}`),
    [navigate]
  );

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>My Memories</h1>

          <div className={styles.moodChips}>
            {MOODS.map((m) => {
              const isActive = mood === m;
              const color = MOOD_COLORS[m];
              return (
                <button
                  key={m}
                  className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
                  style={
                    color
                      ? isActive
                        ? { backgroundColor: color, borderColor: color }
                        : { borderColor: color, color }
                      : {}
                  }
                  onClick={() => setMood(m)}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </header>

        {loading ? (
          <Spinner />
        ) : memories.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📸</span>
            <p>No memories yet. Start capturing your moments!</p>
            <Link to="/create" className={styles.addLink}>
              + Add Memory
            </Link>
          </div>
        ) : (
          <div className={styles.gridWrapper}>
            <MemoryGrid
              memories={memories}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        )}
      </main>
    </div>
  );
}
