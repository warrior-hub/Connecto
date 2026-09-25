const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { getIO } = require("../socket/socket");

// Send Message
// ==========================================
// SEND MESSAGE
// ==========================================

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;

    const {
      receiverId,
      text = "",
    } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required",
      });
    }

    const trimmedText = text?.trim() || "";

    // Image URL from Cloudinary
    const mediaUrl = req.file?.path || "";

    // Must have either text OR image
    if (!trimmedText && !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Message or image is required",
      });
    }

    // ========================================
    // PREVENT SELF MESSAGE
    // ========================================

    if (
      senderId.toString() ===
      receiverId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot send message to yourself",
      });
    }

    // ========================================
    // CHECK RECEIVER
    // ========================================

    const receiver =
      await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // ========================================
    // FIND CONVERSATION
    // ========================================

    let conversation =
      await Conversation.findOne({
        participants: {
          $all: [
            senderId,
            receiverId,
          ],
        },

        $expr: {
          $eq: [
            {
              $size: "$participants",
            },
            2,
          ],
        },
      });

    // ========================================
    // CREATE CONVERSATION
    // ========================================

    if (!conversation) {
      conversation =
        await Conversation.create({
          participants: [
            senderId,
            receiverId,
          ],
        });
    }

    // ========================================
    // MESSAGE TYPE
    // ========================================

    const messageType = mediaUrl
      ? "image"
      : "text";

    // ========================================
    // CREATE MESSAGE
    // ========================================

    const message =
      await Message.create({
        conversation:
          conversation._id,

        sender: senderId,

        receiver: receiverId,

        text: trimmedText,

        mediaUrl,

        messageType,

        status: "sent",
      });

    // ========================================
    // UPDATE CONVERSATION
    // ========================================

    conversation.lastMessage =
      message._id;

    conversation.lastMessageAt =
      new Date();

    await conversation.save();

    // ========================================
    // POPULATE MESSAGE
    // ========================================

    const populatedMessage =
      await Message.findById(
        message._id
      )
        .populate(
          "sender",
          "name username profilePicture"
        )
        .populate(
          "receiver",
          "name username profilePicture"
        );

    // ========================================
    // REAL-TIME SOCKET
    // ========================================

    const io = getIO();

    io.to(receiverId.toString()).emit(
      "newMessage",
      populatedMessage
    );

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error(
      "Send message error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name username profilePicture online lastSeen")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    return res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get messages of conversation
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "name username profilePicture")
      .populate("receiver", "name username profilePicture")
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const startConversation = async (req, res) => {
  try {
    const currentUserId =
      req.user._id.toString();

    const { userId } = req.body;

    // ========================================
    // VALIDATE USER ID
    // ========================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const targetUserId =
      userId.toString();

    // ========================================
    // PREVENT SELF CHAT
    // ========================================

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot start chat with yourself",
      });
    }

    // ========================================
    // CHECK TARGET USER
    // ========================================

    const otherUser =
      await User.findById(targetUserId);

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ========================================
    // FIND EXISTING 1-TO-1 CONVERSATION
    // ========================================

    let conversation =
      await Conversation.findOne({
        participants: {
          $all: [
            currentUserId,
            targetUserId,
          ],
        },

        $expr: {
          $eq: [
            {
              $size: "$participants",
            },
            2,
          ],
        },
      });

    // ========================================
    // CREATE NEW CONVERSATION
    // ========================================

    if (!conversation) {
      conversation =
        await Conversation.create({
          participants: [
            currentUserId,
            targetUserId,
          ],
        });
    }

    // ========================================
    // POPULATE PARTICIPANTS
    // ========================================

    const populatedConversation =
      await Conversation.findById(
        conversation._id
      )
        .populate(
          "participants",
          "name username profilePicture online lastSeen"
        )
        .populate("lastMessage");

    return res.status(200).json({
      success: true,
      conversation:
        populatedConversation,
    });
  } catch (error) {
    console.error(
      "Start conversation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const markMessagesAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    // Check conversation exists
    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check current user is participant
    const isParticipant =
      conversation.participants.some(
        (participant) =>
          participant.toString() ===
          currentUserId.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation",
      });
    }

    // Find unread messages received by current user
    const unreadMessages = await Message.find({
      conversation: conversationId,
      receiver: currentUserId,
      status: { $ne: "read" },
    }).select("_id sender");

    if (unreadMessages.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No unread messages",
        messageIds: [],
      });
    }

    const messageIds = unreadMessages.map(
      (message) => message._id
    );

    // Mark messages as read
    await Message.updateMany(
      {
        _id: { $in: messageIds },
      },
      {
        $set: {
          status: "read",
          readAt: new Date(),
        },
      }
    );

    // Notify original sender(s)
    const io = getIO();

    const senderIds = [
      ...new Set(
        unreadMessages.map(
          (message) =>
            message.sender.toString()
        )
      ),
    ];

    senderIds.forEach((senderId) => {
      io.to(senderId).emit("messagesRead", {
        conversationId:
          conversationId.toString(),
        messageIds: messageIds.map((id) =>
          id.toString()
        ),
      });
    });

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      messageIds: messageIds.map((id) =>
        id.toString()
      ),
    });
  } catch (error) {
    console.error(
      "Mark messages as read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// EDIT MESSAGE
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Sirf sender apna message edit kar sakta hai
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
      });
    }

    // Deleted message edit nahi ho sakta
    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Deleted message cannot be edited",
      });
    }

    // Image/video etc. edit nahi karenge
    if (message.messageType !== "text") {
      return res.status(400).json({
        success: false,
        message: "Only text messages can be edited",
      });
    }

    message.text = text.trim();
    message.edited = true;

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name username profilePicture")
      .populate("receiver", "name username profilePicture");

    const io = getIO();

    // Sender ko
    io.to(message.sender.toString()).emit(
      "messageEdited",
      populatedMessage
    );

    // Receiver ko
    io.to(message.receiver.toString()).emit(
      "messageEdited",
      populatedMessage
    );

    return res.json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Edit message error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// DELETE MESSAGE
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Sirf sender delete kar sakta hai
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Message is already deleted",
      });
    }

    // Soft delete
    message.isDeleted = true;

    // Original content remove
    message.text = "";
    message.mediaUrl = "";

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name username profilePicture")
      .populate("receiver", "name username profilePicture");

    const io = getIO();

    // Sender ko
    io.to(message.sender.toString()).emit(
      "messageDeleted",
      populatedMessage
    );

    // Receiver ko
    io.to(message.receiver.toString()).emit(
      "messageDeleted",
      populatedMessage
    );

    return res.json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = {
  sendMessage,
  getConversations,
  getMessages,
   startConversation,
    markMessagesAsRead,
      editMessage,
  deleteMessage,
};