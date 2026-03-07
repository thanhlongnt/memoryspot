import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MemoryCard from "./MemoryCard.jsx";

export default function MemoryGrid({ memories, onDelete, onEdit }) {
  if (memories.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
        No memories yet.
      </Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {memories.map((memory) => (
        <Grid key={memory._id} size={{ xs: 12, sm: 6, md: 4 }}>
          <MemoryCard memory={memory} onDelete={onDelete} onEdit={onEdit} />
        </Grid>
      ))}
    </Grid>
  );
}
