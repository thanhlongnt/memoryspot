const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 20,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    image: {
      type: String, // base64 Data URL
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    mood: {
      type: String,
      enum: ["Nostalgic", "Travel", "Food", "Music"],
      required: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Memory", memorySchema);
