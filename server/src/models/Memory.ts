import mongoose, { Document, Schema } from "mongoose";
import { Mood } from "../types/shared";

export interface IMemory {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  image: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  mood: Mood;
  dateCreated: Date;
}

export interface MemoryDocument extends IMemory, Document {}

const MOODS: Mood[] = ["Nostalgic", "Travel", "Food", "Music"];

const memorySchema = new Schema<MemoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, maxlength: 20 },
    description: { type: String, default: "", maxlength: 500 },
    image: { type: String, required: true },
    location: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    mood: { type: String, enum: MOODS, required: true },
    dateCreated: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export default mongoose.model<MemoryDocument>("Memory", memorySchema);
