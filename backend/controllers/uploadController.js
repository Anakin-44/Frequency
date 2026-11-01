const cloudinary = require("../config/cloudinary");
const Song = require("../models/Song");

const uploadToCloudinary = (file, resourceType, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: folder,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

exports.uploadSong = async (req, res) => {
  try {
    const { title, artist, album, genre } = req.body;

    if (!title || !artist || !req.files?.audio?.[0]) {
      return res.status(400).json({
        message: "Title, artist and audio file are required",
      });
    }

    const audioResult = await uploadToCloudinary(
      req.files.audio[0],
      "video",
      "frequency/songs",
    );

    let coverResult = null;

    if (req.files.cover?.[0]) {
      coverResult = await uploadToCloudinary(
        req.files.cover[0],
        "image",
        "frequency/covers",
      );
    }

    const song = await Song.create({
      title,
      artist,
      album,
      genre,
      audioUrl: audioResult.secure_url,
      coverUrl: coverResult?.secure_url || "",
      cloudinaryAudioId: audioResult.public_id,
      cloudinaryCoverId: coverResult?.public_id || "",
    });

    res.status(201).json({
      message: "Song uploaded successfully!",
      song,
    });
  } catch (error) {
    console.error("Upload error:", error);

    res.status(500).json({
      message: "Song upload failed",
      error: error.message,
    });
  }
};
