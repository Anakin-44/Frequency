require("dotenv").config();

const mongoose = require("mongoose");
const Song = require("./models/Song");

const songs = [
  {
    title: "SoundHelix Song 1",
    artist: "SoundHelix",
    album: "Demo Collection",
    genre: "Electronic",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "",
    duration: 0,
  },
  {
    title: "SoundHelix Song 2",
    artist: "SoundHelix",
    album: "Demo Collection",
    genre: "Electronic",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "",
    duration: 0,
  },
  {
    title: "SoundHelix Song 3",
    artist: "SoundHelix",
    album: "Demo Collection",
    genre: "Electronic",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "",
    duration: 0,
  },
];

async function seedSongs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Song.deleteMany({});
    await Song.insertMany(songs);

    console.log("Frequency demo songs added successfully!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seedSongs();
