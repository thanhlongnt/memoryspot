import express, { Request, Response } from "express";
import Memory from "../models/Memory";
import authMiddleware from "../middleware/auth";
import { Mood } from "../types/shared";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/memories — list all memories for current user, newest first
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: { userId: string; mood?: string } = {
      userId: req.userId as string,
    };
    if (req.query.mood) {
      filter.mood = req.query.mood as string;
    }

    const memories = await Memory.find(filter).sort({ dateCreated: -1 }).lean();
    res.json(memories);
  } catch {
    res.status(500).json({ error: "Failed to fetch memories" });
  }
});

// GET /api/memories/locations — return only lat/lng/title for map markers
router.get("/locations", async (req: Request, res: Response) => {
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
  } catch {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// GET /api/memories/:id — get single memory (must belong to user)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const memory = await Memory.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).lean();

    if (!memory) {
      res.status(404).json({ error: "Memory not found" });
      return;
    }

    res.json(memory);
  } catch {
    res.status(500).json({ error: "Failed to fetch memory" });
  }
});

// POST /api/memories — create a new memory
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      image,
      location,
      latitude,
      longitude,
      mood,
    } = req.body as {
      title: string;
      description?: string;
      image: string;
      location?: string;
      latitude?: number | null;
      longitude?: number | null;
      mood: Mood;
    };

    if (!title || !image || !mood) {
      res
        .status(400)
        .json({ error: "title, image, and mood are required" });
      return;
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
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ValidationError") {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Failed to create memory" });
  }
});

// PUT /api/memories/:id — update memory (must belong to user)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { title, description, image, location, latitude, longitude, mood } =
      req.body as {
        title: string;
        description?: string;
        image: string;
        location?: string;
        latitude?: number | null;
        longitude?: number | null;
        mood: Mood;
      };

    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, description, image, location, latitude, longitude, mood },
      { new: true, runValidators: true }
    );

    if (!memory) {
      res.status(404).json({ error: "Memory not found" });
      return;
    }

    res.json(memory);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ValidationError") {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Failed to update memory" });
  }
});

// DELETE /api/memories/:id — delete memory (must belong to user)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const memory = await Memory.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!memory) {
      res.status(404).json({ error: "Memory not found" });
      return;
    }

    res.json({ message: "Memory deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete memory" });
  }
});

export default router;
