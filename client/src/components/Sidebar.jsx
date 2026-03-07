import React from "react";
import { Link } from "react-router-dom";
import MemoryGrid from "./MemoryGrid.jsx";
import styles from "./Sidebar.module.css";

export default function Sidebar({ memories, isOpen, onClose, onDelete, onEdit }) {
  return (
    <aside className={`${styles.aside} ${isOpen ? styles.open : ""}`}>
      <header className={styles.header}>
        <h2>Your Memories</h2>
        <div className={styles.headerActions}>
          <Link to="/create" className={styles.addBtn}>
            + Add Memory
          </Link>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close sidebar">
            ✕
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <MemoryGrid memories={memories} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </aside>
  );
}
