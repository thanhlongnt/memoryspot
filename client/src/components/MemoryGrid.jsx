import React from "react";
import MemoryCard from "./MemoryCard.jsx";
import styles from "./MemoryGrid.module.css";

export default function MemoryGrid({ memories, onDelete, onEdit }) {
  if (memories.length === 0) {
    return (
      <p className={styles.empty}>
        No memories yet. <a href="/create">Add your first one!</a>
      </p>
    );
  }

  return (
    <div className={styles.grid}>
      {memories.map((memory) => (
        <MemoryCard
          key={memory._id}
          memory={memory}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
