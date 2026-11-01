const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    artist: {
      type: String,
      required: true,
      trim: true,
    },

    album: {
      type: String,
      default: "Unknown Album",
    },

    genre: {
      type: String,
      default: "Other",
    },

    audioUrl: {
      type: String,
      required: true,
    },

    coverUrl: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
    },

    cloudinaryAudioId: {
      type: String,
      default: "",
    },

    cloudinaryCoverId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Song", songSchema);
