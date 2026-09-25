
const express = require("express");

const {
  sendMessage,
  getConversations,
  getMessages,
  startConversation,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
} = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/messageUploadMiddleware");

const router = express.Router();

// ==========================================
// START / FIND CONVERSATION
// ==========================================

router.post(
  "/conversations",
  protect,
  startConversation
);

// ==========================================
// GET ALL CONVERSATIONS
// ==========================================

router.get(
  "/conversations",
  protect,
  getConversations
);

// ==========================================
// SEND MESSAGE
// ==========================================

router.post(
  "/",
  protect,
  upload.single("media"),
  sendMessage
);

// ==========================================
// MARK MESSAGES AS READ
// ==========================================

router.patch(
  "/:conversationId/read",
  protect,
  markMessagesAsRead
);

// ==========================================
// GET MESSAGES
// ==========================================

router.get(
  "/:conversationId",
  protect,
  getMessages
);

router.patch(
  "/:messageId",
  protect,
  editMessage
);

router.delete(
  "/:messageId",
  protect,
  deleteMessage
);
// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
