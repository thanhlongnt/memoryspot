const express = require("express");
const Memory = require("../models/Memory");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/memories — list all memories for current user, newest first
// Optional query: ?mood=Nostalgic
router.get("/", async (req, res) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.mood) {
      filter.mood = req.query.mood;
    }

    const memories = await Memory.find(filter)
      .sort({ dateCreated: -1 })
      .lean();

    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch memories" });
  }
});

// GET /api/memories/locations — return only lat/lng/title for map markers
router.get("/locations", async (req, res) => {
  try {
    const memories = await Memory.find(
      { userId: req.userId },
      "latitude longitude title mood _id"
    ).lean();

    const coords = memories
      .filter((m) => m.latitude !== null && m.longitude !== null)
      .map((m) => ({
        _id: m._id,
        latitude: m.latitude,
        longitude: m.longitude,
        title: m.title,
        mood: m.mood,
      }));

    res.json(coords);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// GET /api/memories/:id — get single memory (must belong to user)
router.get("/:id", async (req, res) => {
  try {
    const memory = await Memory.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).lean();

    if (!memory) {
      return res.status(404).json({ error: "Memory not found" });
    }

    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch memory" });
  }
});

// POST /api/memories — create a new memory
router.post("/", async (req, res) => {
  try {
    const { title, description, image, location, latitude, longitude, mood } =
      req.body;

    if (!title || !image || !mood) {
      return res
        .status(400)
        .json({ error: "title, image, and mood are required" });
    }

    const memory = await Memory.create({
      userId: req.userId,
      title,
      description: description ?? "",
      image,
      location: location ?? "",
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      mood,
      dateCreated: new Date(),
    });

    res.status(201).json(memory);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to create memory" });
  }
});

// PUT /api/memories/:id — update memory (must belong to user)
router.put("/:id", async (req, res) => {
  try {
    const { title, description, image, location, latitude, longitude, mood } =
      req.body;

    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, description, image, location, latitude, longitude, mood },
      { new: true, runValidators: true }
    );

    if (!memory) {
      return res.status(404).json({ error: "Memory not found" });
    }

    res.json(memory);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to update memory" });
  }
});

// DELETE /api/memories/:id — delete memory (must belong to user)
router.delete("/:id", async (req, res) => {
  try {
    const memory = await Memory.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!memory) {
      return res.status(404).json({ error: "Memory not found" });
    }

    res.json({ message: "Memory deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete memory" });
  }
});

module.exports = router;
