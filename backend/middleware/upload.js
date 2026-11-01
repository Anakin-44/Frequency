const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "audio") {
      if (file.mimetype.startsWith("audio/")) {
        return cb(null, true);
      }

      return cb(new Error("Only audio files are allowed"));
    }

    if (file.fieldname === "cover") {
      if (file.mimetype.startsWith("image/")) {
        return cb(null, true);
      }

      return cb(new Error("Only image files are allowed"));
    }

    cb(new Error("Unexpected file field"));
  },
});

module.exports = upload;
