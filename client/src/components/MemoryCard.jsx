import React, { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ConfirmModal from "./ConfirmModal.jsx";

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
  const { _id, title, description, image, location, mood, dateCreated } = memory;
  const [showConfirm, setShowConfirm] = useState(false);
  const moodColor = MOOD_COLORS[mood] ?? "#374869";

  async function handleDeleteConfirm() {
    setShowConfirm(false);
    await onDelete(_id);
  }

  return (
    <>
      <Card component="article" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={image}
            alt={description || "memory image"}
            sx={{ height: 180, objectFit: "cover" }}
          />
          <Chip
            label={mood}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: moodColor,
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.7rem",
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: 0 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {formatDate(dateCreated)}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {description || "No description provided."}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {location || "No location"}
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
          <IconButton size="small" onClick={() => onEdit(_id)} aria-label="Edit memory" title="Edit">
            <EditIcon fontSize="small" color="primary" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setShowConfirm(true)}
            aria-label="Delete memory"
            title="Delete"
          >
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </CardActions>
      </Card>

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
