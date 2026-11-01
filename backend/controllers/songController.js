const mongoose = require("mongoose");
const Song = require("../models/Song");

// GET ALL SONGS
exports.getSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });

    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE SONG
exports.getSongById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }

    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEARCH SONGS
exports.searchSongs = async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q) {
      return res.status(200).json([]);
    }

    const songs = await Song.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { artist: { $regex: q, $options: "i" } },
        { album: { $regex: q, $options: "i" } },
      ],
    });

    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD SONG
exports.addSong = async (req, res) => {
  try {
    const { title, artist, album, genre, audioUrl, coverUrl, duration } =
      req.body;

    if (!title || !artist || !audioUrl) {
      return res.status(400).json({
        message: "Title, artist and audio URL are required",
      });
    }

    const song = await Song.create({
      title,
      artist,
      album,
      genre,
      audioUrl,
      coverUrl,
      duration,
    });

    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE SONG
exports.deleteSong = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }

    const song = await Song.findByIdAndDelete(req.params.id);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.status(200).json({
      message: "Song deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
