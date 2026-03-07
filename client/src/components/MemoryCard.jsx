import React from "react";
import styles from "./MemoryCard.module.css";

const MOOD_COLORS = {
  Nostalgic: "#ff9d24",
  Travel: "#1be287",
  Food: "#ff247d",
  Music: "#2496ff",
};

function formatDate(raw) {
  const d = new Date(raw);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function MemoryCard({ memory, onDelete, onEdit }) {
  const { _id, title, description, image, location, mood, dateCreated } =
    memory;

  const moodColor = MOOD_COLORS[mood] ?? "#000";

  function handleDelete() {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      onDelete(_id);
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        <img src={image} alt={description || "memory image"} />
      </div>

      <div className={styles.content}>
        <div className={styles.meta}>
          <span
            className={styles.mood}
            style={{ backgroundColor: moodColor }}
          >
            {mood}
          </span>
          <time className={styles.date}>{formatDate(dateCreated)}</time>
          <div className={styles.actions}>
            <button
              onClick={() => onEdit(_id)}
              aria-label="Edit memory"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              aria-label="Delete memory"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>
          {description || "No description provided."}
        </p>

        <footer className={styles.footer}>
          <span>📍 {location || "No Location Provided"}</span>
        </footer>
      </div>
    </article>
  );
}
