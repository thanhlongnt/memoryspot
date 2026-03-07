import React, { useState } from "react";
import styles from "./MemoryCard.module.css";
import ConfirmModal from "./ConfirmModal.jsx";
import { useToast } from "../context/ToastContext.jsx";

const MOOD_COLORS = {
  Nostalgic: "#ff9d24",
  Travel: "#1be287",
  Food: "#ff247d",
  Music: "#2496ff",
};

function formatDate(raw) {
  return new Date(raw).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MemoryCard({ memory, onDelete, onEdit }) {
  const { _id, title, description, image, location, mood, dateCreated } =
    memory;
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useToast();

  const moodColor = MOOD_COLORS[mood] ?? "#000";

  async function handleDeleteConfirm() {
    setShowConfirm(false);
    await onDelete(_id);
    showToast("Memory deleted", "success");
  }

  return (
    <>
      <article className={styles.card}>
        <div className={styles.photo}>
          <img src={image} alt={description || "memory image"} />
          <span
            className={styles.moodBadge}
            style={{ backgroundColor: moodColor }}
          >
            {mood}
          </span>
        </div>

        <div className={styles.content}>
          <div className={styles.meta}>
            <time className={styles.date}>{formatDate(dateCreated)}</time>
            <div className={styles.actions}>
              <button
                className={`${styles.actionBtn} ${styles.editBtn}`}
                onClick={() => onEdit(_id)}
                aria-label="Edit memory"
                title="Edit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => setShowConfirm(true)}
                aria-label="Delete memory"
                title="Delete"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
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

      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to delete this memory?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
