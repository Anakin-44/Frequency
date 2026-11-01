const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadSong } = require("../controllers/uploadController");
const {
  getSongs,
  getSongById,
  searchSongs,
  addSong,
  deleteSong,
} = require("../controllers/songController");

router.post(
  "/upload",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadSong,
);

// GET /api/songs/search?q=
router.get("/search", searchSongs);

// GET /api/songs
router.get("/", getSongs);

// GET /api/songs/:id
router.get("/:id", getSongById);

// POST /api/songs
router.post("/", addSong);

// DELETE /api/songs/:id
router.delete("/:id", deleteSong);

module.exports = router;
