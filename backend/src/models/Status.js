const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    // ==========================================
    // STATUS OWNER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // STATUS TYPE
    // ==========================================

    type: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
      required: true,
    },

    // ==========================================
    // TEXT STATUS
    // ==========================================

    text: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // ==========================================
    // MEDIA URL
    // ==========================================

    mediaUrl: {
      type: String,
      default: "",
    },

    // ==========================================
    // BACKGROUND COLOR
    // ==========================================

    backgroundColor: {
      type: String,
      default: "#005c4b",
    },

    // ==========================================
    // VIEWERS
    // ==========================================

    viewers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ==========================================
    // EXPIRY
    // ==========================================

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Status",
  statusSchema
);