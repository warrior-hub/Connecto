const multer = require("multer");
const { CloudinaryStorage } = require(
  "multer-storage-cloudinary"
);

const cloudinary = require(
  "../config/cloudinary"
);

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vibetalk/profile-pictures",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],
    transformation: [
      {
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "face",
      },
    ],
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files are allowed"
        ),
        false
      );
    }
  },
});

module.exports = upload;