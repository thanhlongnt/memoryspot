import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./config/passport";

import authRoutes from "./routes/auth";
import memoriesRoutes from "./routes/memories";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Session is only used internally by Passport during the OAuth redirect flow
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/api/memories", memoriesRoutes);

// Expose Maps API key to client (keeps it out of client .env in production)
app.get("/api/config", (_req, res) => {
  res.json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "" });
});

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ─── Database & Server ───────────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

start();

export default app;
