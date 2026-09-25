const express = require("express");

const {
  getUsers,
  updateProfile,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// GET ALL USERS
router.get(
  "/",
  protect,
  getUsers
);


// UPDATE PROFILE + PROFILE PICTURE
router.patch(
  "/profile",
  protect,
  upload.single("profilePicture"),
  updateProfile
);


module.exports = router;