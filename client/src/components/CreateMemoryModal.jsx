import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useMaps } from "../context/MapsContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  createMemory,
  updateMemory,
  getMemory,
  fileToDataUrl,
} from "../api/memories.js";

const MOODS = ["Nostalgic", "Travel", "Food", "Music"];

export default function CreateMemoryModal({ open, onClose, memoryId }) {
  const { isLoaded } = useMaps();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const locationInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Reset form
    setTitle("");
    setDescription("");
    setLocation("");
    setMood("");
    setImagePreview("");
    setImageDataUrl("");
    setLat(null);
    setLng(null);
    setError("");

    if (memoryId) {
      getMemory(memoryId)
        .then((mem) => {
          setTitle(mem.title);
          setDescription(mem.description);
          setLocation(mem.location);
          setMood(mem.mood);
          setImagePreview(mem.image);
          setImageDataUrl(mem.image);
          setLat(mem.latitude);
          setLng(mem.longitude);
        })
        .catch(() => onClose(false));
    }
  }, [open, memoryId]);

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setImagePreview(dataUrl);
    setImageDataUrl(dataUrl);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  async function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    setImagePreview(dataUrl);
    setImageDataUrl(dataUrl);
  }

  // Initialize Google Places Autocomplete directly on the native <input>.
  // Uses rAF to ensure MUI Dialog's portal has fully painted before we read the ref.
  // The pac-container z-index is raised globally in App.jsx so it appears above the Dialog.
  useEffect(() => {
    if (!isLoaded || !open) return;

    let listener;
    const rafId = requestAnimationFrame(() => {
      const input = locationInputRef.current;
      if (!input) return;

      const ac = new window.google.maps.places.Autocomplete(input, {
        types: ["geocode"],
        componentRestrictions: { country: "us" },
        fields: ["address_components", "geometry", "formatted_address"],
      });

      listener = ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place?.geometry) return;
        setLocation(place.formatted_address ?? "");
        setLat(place.geometry.location.lat() + Math.random() * 0.0003);
        setLng(place.geometry.location.lng() + Math.random() * 0.0003);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (listener) window.google.maps.event.removeListener(listener);
    };
  }, [isLoaded, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!imageDataUrl || !title || !mood || !location) {
      setError("Please fill in all required fields: image, title, mood, and location.");
      return;
    }
    if (title.length > 20) {
      setError("Title must be 20 characters or fewer.");
      return;
    }
    if (description.length > 500) {
      setError("Description must be 500 characters or fewer.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        image: imageDataUrl,
        location,
        latitude: lat,
        longitude: lng,
        mood,
      };

      if (memoryId) {
        await updateMemory(memoryId, payload);
      } else {
        await createMemory(payload);
      }

      showToast(memoryId ? "Memory updated!" : "Memory saved!", "success");
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to save memory.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {memoryId ? "Edit Memory" : "Add Memory"}
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Image Upload */}
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              border: dragging ? "2px dashed #374869" : "2px dashed #cdd3de",
              borderRadius: 2,
              p: 2,
              textAlign: "center",
              mb: 2,
              cursor: "pointer",
              bgcolor: dragging ? "rgba(55,72,105,0.05)" : "transparent",
              transition: "all 0.2s",
            }}
          >
            {imagePreview ? (
              <Box
                component="img"
                src={imagePreview}
                alt="Preview"
                sx={{
                  width: "100%",
                  maxHeight: 200,
                  objectFit: "cover",
                  borderRadius: 1,
                  mb: 1,
                }}
              />
            ) : (
              <CloudUploadIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
            )}
            <label>
              <Button
                component="span"
                variant="outlined"
                size="small"
                sx={{ textTransform: "none" }}
              >
                {imagePreview ? "Change image" : "Upload image *"}
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
            {!imagePreview && (
              <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                or drag & drop here
              </Typography>
            )}
          </Box>

          {/* Title */}
          <TextField
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            inputProps={{ maxLength: 20 }}
            helperText={`${title.length}/20`}
            fullWidth
            sx={{ mb: 2 }}
            size="small"
          />

          {/* Mood */}
          <FormControl fullWidth sx={{ mb: 2 }} size="small">
            <InputLabel>Mood *</InputLabel>
            <Select
              value={mood}
              label="Mood *"
              onChange={(e) => setMood(e.target.value)}
            >
              {MOODS.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Location — inputRef attaches Google Places Autocomplete to the native <input> */}
          <TextField
            label="Location *"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={isLoaded ? "Search for a location…" : "Enter location…"}
            inputRef={locationInputRef}
            fullWidth
            sx={{ mb: 2 }}
            size="small"
          />

          {/* Description */}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${description.length}/500`}
            multiline
            rows={4}
            fullWidth
            size="small"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => onClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ? "Saving…" : memoryId ? "Update Memory" : "Save Memory"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
