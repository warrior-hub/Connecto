const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // MESSAGE TEXT
    // ==========================================

    text: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    // ==========================================
    // IMAGE / MEDIA URL
    // ==========================================

    mediaUrl: {
      type: String,
      default: "",
    },

    // ==========================================
    // MESSAGE TYPE
    // ==========================================

    messageType: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "document",
      ],
      default: "text",
    },

    // ==========================================
    // EDITED
    // ==========================================

    edited: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // DELETED
    // ==========================================

    isDeleted: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // MESSAGE STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "sent",
        "delivered",
        "read",
      ],
      default: "sent",
    },

    // ==========================================
    // READ TIME
    // ==========================================

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Message",
    messageSchema
  );