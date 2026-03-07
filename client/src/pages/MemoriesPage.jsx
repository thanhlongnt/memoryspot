import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import MemoryGrid from "../components/MemoryGrid.jsx";
import { getAllMemories, deleteMemory } from "../api/memories.js";
import styles from "./MemoriesPage.module.css";

const MOODS = ["All Moods", "Nostalgic", "Travel", "Food", "Music"];

export default function MemoriesPage() {
  const [memories, setMemories] = useState([]);
  const [mood, setMood] = useState("All Moods");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleDelete = useCallback(async (id) => {
    await deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m._id !== id));
  }, []);

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

          <div className={styles.filters}>
            <label htmlFor="mood-filter" className={styles.filterLabel}>
              Mood:
            </label>
            <select
              id="mood-filter"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className={styles.moodSelect}
            >
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </header>

        {loading ? (
          <p className={styles.loading}>Loading memories…</p>
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
