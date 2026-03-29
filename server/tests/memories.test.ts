import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import express from "express";

process.env.JWT_SECRET = "test-secret";
process.env.CLIENT_URL = "http://localhost:5173";

import Memory from "../src/models/Memory";
import User from "../src/models/User";
import memoriesRouter from "../src/routes/memories";

// Minimal express app for testing
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use("/api/memories", memoriesRouter);

let mongod: MongoMemoryServer;
let userId: string;
let token: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const user = await User.create({
    googleId: "google-test-123",
    displayName: "Test User",
    email: "test@example.com",
  });
  userId = user._id.toString();
  token = jwt.sign({ userId }, "test-secret", { expiresIn: "1h" });
});

afterEach(async () => {
  await Memory.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

const AUTH = (): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});

const SAMPLE = {
  title: "Test Memory",
  description: "A great day",
  image: "data:image/png;base64,abc123",
  location: "San Diego, CA",
  latitude: 32.7157,
  longitude: -117.1611,
  mood: "Travel",
};

describe("POST /api/memories", () => {
  it("creates a memory and returns 201", async () => {
    const res = await request(app)
      .post("/api/memories")
      .set(AUTH())
      .send(SAMPLE);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test Memory");
    expect(res.body.userId).toBe(userId);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/memories")
      .set(AUTH())
      .send({ description: "no title or mood" });
    expect(res.status).toBe(400);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/memories").send(SAMPLE);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/memories", () => {
  beforeEach(async () => {
    await Memory.create({ ...SAMPLE, userId, mood: "Travel" });
    await Memory.create({
      ...SAMPLE,
      title: "Food mem",
      userId,
      mood: "Food",
    });
  });

  it("returns all memories for the user", async () => {
    const res = await request(app).get("/api/memories").set(AUTH());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("filters by mood", async () => {
    const res = await request(app)
      .get("/api/memories?mood=Food")
      .set(AUTH());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].mood).toBe("Food");
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/memories");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/memories/locations", () => {
  it("returns only lat/lng/title", async () => {
    await Memory.create({ ...SAMPLE, userId });
    const res = await request(app)
      .get("/api/memories/locations")
      .set(AUTH());
    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty("latitude");
    expect(res.body[0]).toHaveProperty("longitude");
    expect(res.body[0]).toHaveProperty("title");
    expect(res.body[0]).not.toHaveProperty("image");
  });
});

describe("GET /api/memories/:id", () => {
  it("returns a single memory", async () => {
    const mem = await Memory.create({ ...SAMPLE, userId });
    const res = await request(app)
      .get(`/api/memories/${mem._id}`)
      .set(AUTH());
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Test Memory");
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app)
      .get("/api/memories/000000000000000000000001")
      .set(AUTH());
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/memories/:id", () => {
  it("updates a memory", async () => {
    const mem = await Memory.create({ ...SAMPLE, userId });
    const res = await request(app)
      .put(`/api/memories/${mem._id}`)
      .set(AUTH())
      .send({ ...SAMPLE, title: "Updated Title" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Title");
  });

  it("returns 404 for another user's memory", async () => {
    const otherUser = await User.create({
      googleId: "other-google-id",
      displayName: "Other",
      email: "other@example.com",
    });
    const mem = await Memory.create({ ...SAMPLE, userId: otherUser._id });
    const res = await request(app)
      .put(`/api/memories/${mem._id}`)
      .set(AUTH())
      .send({ ...SAMPLE, title: "Stolen" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/memories/:id", () => {
  it("deletes a memory", async () => {
    const mem = await Memory.create({ ...SAMPLE, userId });
    const res = await request(app)
      .delete(`/api/memories/${mem._id}`)
      .set(AUTH());
    expect(res.status).toBe(200);
    const gone = await Memory.findById(mem._id);
    expect(gone).toBeNull();
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app)
      .delete("/api/memories/000000000000000000000001")
      .set(AUTH());
    expect(res.status).toBe(404);
  });
});
