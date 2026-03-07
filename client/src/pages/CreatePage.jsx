import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Autocomplete } from "@react-google-maps/api";
import Navbar from "../components/Navbar.jsx";
import { useMaps } from "../context/MapsContext.jsx";
import {
  createMemory,
  updateMemory,
  getMemory,
  fileToDataUrl,
} from "../api/memories.js";
import styles from "./CreatePage.module.css";

const MOODS = ["Nostalgic", "Travel", "Food", "Music"];

export default function CreatePage() {
  const { id } = useParams(); // present when editing
  const navigate = useNavigate();
  const { isLoaded } = useMaps();
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

  const autocompleteRef = useRef(null);

  // If editing, pre-fill form
  useEffect(() => {
    if (!id) return;
    getMemory(id)
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
      .catch(() => navigate("/memories"));
  }, [id, navigate]);

  async function handleImageChange(e) {
    const files = e.target.files;
    if (files.length > 1) {
      alert("Please select only one image file.");
      e.target.value = "";
      return;
    }
    const file = files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setImagePreview(dataUrl);
    setImageDataUrl(dataUrl);
  }

  function onPlaceChanged() {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry) return;
    setLocation(place.formatted_address ?? "");
    setLat(place.geometry.location.lat() + Math.random() * 0.0003);
    setLng(place.geometry.location.lng() + Math.random() * 0.0003);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!imageDataUrl || !title || !mood || !location) {
      setError(
        "Please fill in all required fields: image, title, mood, and location."
      );
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

      if (id) {
        await updateMemory(id, payload);
      } else {
        await createMemory(payload);
      }

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to save memory.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h1>{id ? "Edit Memory" : "Add Memory"}</h1>

            {error && <p className={styles.error}>{error}</p>}

            {/* Image upload */}
            <div className={styles.uploadArea}>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={styles.preview}
                />
              )}
              <label className={styles.uploadLabel}>
                {imagePreview ? "Change image" : "Upload image *"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
              </label>
            </div>

            <div className={styles.sections}>
              <div className={styles.leftSection}>
                <label htmlFor="title">Title * (max 20 chars)</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={20}
                  required
                />

                <label htmlFor="mood">Mood *</label>
                <select
                  id="mood"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  required
                  className={styles.select}
                >
                  <option value="" disabled>
                    Select a mood
                  </option>
                  {MOODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.rightSection}>
                <label htmlFor="location">Location *</label>
                {isLoaded ? (
                  <Autocomplete
                    onLoad={(ref) => (autocompleteRef.current = ref)}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                      types: ["geocode"],
                      componentRestrictions: { country: "us" },
                      fields: ["address_components", "geometry", "formatted_address"],
                    }}
                  >
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Search for a location…"
                      required
                    />
                  </Autocomplete>
                ) : (
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location…"
                    required
                  />
                )}

                <label htmlFor="description">Description (max 500 chars)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={5}
                />
                <small className={styles.charCount}>
                  {description.length}/500
                </small>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={styles.submitBtn}
            >
              {submitting ? "Saving…" : id ? "Update Memory" : "Save Memory"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
