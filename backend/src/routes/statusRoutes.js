const express = require("express");
const upload = require(
  "../middleware/statusUploadMiddleware"
);
const {
  createStatus,
  getMyStatus,
  getOtherStatuses,
  markStatusViewed,
   deleteStatus,
} = require("../controllers/statusController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("media"),
  createStatus
);

router.get(
  "/me",
  protect,
  getMyStatus
);

router.get(
  "/",
  protect,
  getOtherStatuses
);

router.patch(
  "/:statusId/view",
  protect,
  markStatusViewed
);

router.delete(
  "/:statusId",
  protect,
  deleteStatus
);

module.exports = router;