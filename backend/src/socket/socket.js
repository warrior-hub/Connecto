const User = require("../models/User");
const Message = require("../models/Message");

// ==========================================
// CONNECTED USERS
// ==========================================

// userId -> socketId
const connectedUsers = new Map();

let ioInstance = null;

// ==========================================
// SETUP SOCKET.IO
// ==========================================

const setupSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log(
      "================================="
    );
    console.log(
      "Socket connected:",
      socket.id
    );
    console.log(
      "================================="
    );

    // ========================================
    // JOIN USER ROOM
    // ========================================

    socket.on("join", async (userId) => {
      try {
        if (!userId) {
          console.log(
            "Socket join failed: userId missing"
          );

          return;
        }

        const normalizedUserId =
          userId.toString();

        // ==================================
        // CHECK USER
        // ==================================

        const user =
          await User.findById(
            normalizedUserId
          );

        if (!user) {
          console.log(
            "Socket join failed - user not found:",
            normalizedUserId
          );

          return;
        }

        // ==================================
        // SAVE USER ID ON SOCKET
        // ==================================

        socket.userId =
          normalizedUserId;

        // ==================================
        // JOIN PERSONAL ROOM
        // ==================================

        socket.join(
          normalizedUserId
        );

        // ==================================
        // SAVE ACTIVE SOCKET
        // ==================================

        connectedUsers.set(
          normalizedUserId,
          socket.id
        );

        // ==================================
        // UPDATE ONLINE STATUS
        // ==================================

        await User.findByIdAndUpdate(
          normalizedUserId,
          {
            $set: {
              online: true,
              lastSeen: null,
            },
          }
        );

        console.log(
          `🟢 User ${normalizedUserId} joined room`
        );

        console.log(
          "Connected users:",
          Array.from(
            connectedUsers.keys()
          )
        );

        // ==================================
        // INFORM OTHER USERS
        // ==================================

        socket.broadcast.emit(
          "userOnline",
          {
            userId:
              normalizedUserId,
          }
        );
      } catch (error) {
        console.error(
          "Socket join error:",
          error
        );
      }
    });

    // ========================================
    // MESSAGE DELIVERED
    // ========================================

    socket.on(
      "messageDelivered",
      async ({ messageId }) => {
        try {
          if (!messageId) {
            return;
          }

          // ==================================
          // FIND MESSAGE
          // ==================================

          const message =
            await Message.findById(
              messageId
            );

          if (!message) {
            console.log(
              "Message not found:",
              messageId
            );

            return;
          }

          // ==================================
          // SECURITY CHECK
          // ==================================

          if (
            !socket.userId ||
            message.receiver
              .toString() !==
              socket.userId
          ) {
            console.log(
              "Unauthorized delivery update:",
              messageId
            );

            return;
          }

          // ==================================
          // ALREADY READ
          // ==================================

          if (
            message.status ===
            "read"
          ) {
            return;
          }

          // ==================================
          // UPDATE STATUS
          // ==================================

          message.status =
            "delivered";

          await message.save();

          console.log(
            `Message ${messageId} marked as delivered`
          );

          // ==================================
          // INFORM SENDER
          // ==================================

          io.to(
            message.sender.toString()
          ).emit(
            "messageDelivered",
            {
              messageId:
                message._id.toString(),

              conversationId:
                message.conversation.toString(),
            }
          );
        } catch (error) {
          console.error(
            "Message delivery error:",
            error
          );
        }
      }
    );

    // ========================================
    // VIDEO CALL
    // CALLER -> RECEIVER
    // ========================================

    socket.on(
      "callUser",
      async ({
        receiverId,
        caller,
      }) => {
        try {
          console.log("");
          console.log(
            "================================="
          );
          console.log(
            "📞 VIDEO CALL REQUEST"
          );
          console.log(
            "================================="
          );

          // ==================================
          // CHECK RECEIVER
          // ==================================

          if (!receiverId) {
            console.log(
              "❌ Receiver ID missing"
            );

            socket.emit(
              "callError",
              {
                message:
                  "Receiver ID is missing",
              }
            );

            return;
          }

          // ==================================
          // CHECK CALLER
          // ==================================

          if (!socket.userId) {
            console.log(
              "❌ Caller socket user missing"
            );

            socket.emit(
              "callError",
              {
                message:
                  "Your socket is not connected to a user",
              }
            );

            return;
          }

          // ==================================
          // SECURITY
          // Caller must be current user
          // ==================================

          if (
            caller?._id &&
            caller._id.toString() !==
              socket.userId
          ) {
            console.log(
              "❌ Caller ID mismatch"
            );

            socket.emit(
              "callError",
              {
                message:
                  "Invalid caller",
              }
            );

            return;
          }

          // ==================================
          // FIND RECEIVER
          // ==================================

          const receiver =
            await User.findById(
              receiverId
            ).select(
              "_id name username profilePicture online"
            );

          if (!receiver) {
            console.log(
              "❌ Receiver not found:",
              receiverId
            );

            socket.emit(
              "callError",
              {
                message:
                  "User not found",
              }
            );

            return;
          }

          // ==================================
          // CANNOT CALL YOURSELF
          // ==================================

          if (
            receiver._id.toString() ===
            socket.userId
          ) {
            console.log(
              "❌ Cannot call yourself"
            );

            socket.emit(
              "callError",
              {
                message:
                  "You cannot call yourself",
              }
            );

            return;
          }

          // ==================================
          // CHECK RECEIVER ONLINE
          // ==================================

          const receiverSocketId =
            connectedUsers.get(
              receiver._id.toString()
            );

          if (!receiverSocketId) {
            console.log(
              "🔴 Receiver offline:",
              receiver.name
            );

            socket.emit(
              "callUnavailable",
              {
                receiverId:
                  receiver._id.toString(),

                message:
                  `${receiver.name} is offline`,
              }
            );

            return;
          }

          // ==================================
          // CALLER DATA
          // ==================================

          const callerData = {
            _id:
              socket.userId,

            name:
              caller?.name ||
              "User",

            username:
              caller?.username ||
              "",

            profilePicture:
              caller?.profilePicture ||
              "",
          };

          console.log(
            "Caller:",
            callerData
          );

          console.log(
            "Receiver:",
            {
              _id:
                receiver._id.toString(),

              name:
                receiver.name,
            }
          );

          console.log(
            "Receiver Socket:",
            receiverSocketId
          );

          // ==================================
          // SEND INCOMING CALL
          // ==================================

          io.to(
            receiverSocketId
          ).emit(
            "incomingCall",
            {
              caller:
                callerData,

              callType:
                "video",
            }
          );

          console.log(
            "✅ Incoming video call sent"
          );

          console.log(
            "================================="
          );
        } catch (error) {
          console.error(
            "❌ callUser error:",
            error
          );

          socket.emit(
            "callError",
            {
              message:
                "Unable to start video call",
            }
          );
        }
      }
    );

    // ========================================
    // CALL ACCEPTED
    // RECEIVER -> CALLER
    // ========================================

    socket.on(
      "callAccepted",
      ({
        callerId,
        receiverId,
      }) => {
        try {
          console.log(
            "✅ CALL ACCEPTED"
          );

          if (!callerId) {
            return;
          }

          const callerSocketId =
            connectedUsers.get(
              callerId.toString()
            );

          if (!callerSocketId) {
            console.log(
              "Caller is offline"
            );

            return;
          }

          io.to(
            callerSocketId
          ).emit(
            "callAccepted",
            {
              receiverId:
                receiverId
                  ? receiverId.toString()
                  : socket.userId,
            }
          );
        } catch (error) {
          console.error(
            "callAccepted error:",
            error
          );
        }
      }
    );

    // ========================================
    // CALL REJECTED
    // RECEIVER -> CALLER
    // ========================================

    socket.on(
      "callRejected",
      ({
        callerId,
      }) => {
        try {
          console.log(
            "❌ CALL REJECTED"
          );

          if (!callerId) {
            return;
          }

          const callerSocketId =
            connectedUsers.get(
              callerId.toString()
            );

          if (!callerSocketId) {
            return;
          }

          io.to(
            callerSocketId
          ).emit(
            "callRejected",
            {
              userId:
                socket.userId,
            }
          );
        } catch (error) {
          console.error(
            "callRejected error:",
            error
          );
        }
      }
    );

    // ========================================
    // END CALL
    // ========================================
// ========================================
// END CALL
// ========================================

socket.on(
  "endCall",
  ({
    userId,
  }) => {
    try {
      console.log(
        "📴 END CALL"
      );

      if (!userId) {
        console.log(
          "❌ Target user ID missing"
        );

        return;
      }

      const targetSocketId =
        connectedUsers.get(
          userId.toString()
        );

      if (!targetSocketId) {
        console.log(
          "❌ Target user socket not found:",
          userId
        );

        return;
      }

      console.log(
        "📡 Sending endCall to:",
        userId
      );

      io.to(
        targetSocketId
      ).emit(
        "endCall",
        {
          userId:
            socket.userId,
        }
      );

      console.log(
        "✅ endCall event sent"
      );

    } catch (error) {
      console.error(
        "❌ endCall error:",
        error
      );
    }
  }
);


   
// ==========================================
// WEBRTC OFFER
// ==========================================
socket.on("webrtcOffer", ({ targetUserId, offer }) => {
  try {
    if (!targetUserId || !offer) {
      console.error("❌ WebRTC offer data missing");
      return;
    }

    const targetSocketId = connectedUsers.get(
      targetUserId.toString()
    );

    if (!targetSocketId) {
      console.log("❌ Target user is offline:", targetUserId);
      return;
    }

    console.log("📨 Forwarding WebRTC offer");
    console.log("From:", socket.userId);
    console.log("To:", targetUserId);

    io.to(targetSocketId).emit("webrtcOffer", {
      callerId: socket.userId,
      offer,
    });
  } catch (error) {
    console.error("❌ WebRTC offer error:", error);
  }
});


// ==========================================
// WEBRTC ANSWER
// ==========================================
socket.on("webrtcAnswer", ({ targetUserId, answer }) => {
  try {
    if (!targetUserId || !answer) {
      console.error("❌ WebRTC answer data missing");
      return;
    }

    const targetSocketId = connectedUsers.get(
      targetUserId.toString()
    );

    if (!targetSocketId) {
      console.log("❌ Target user is offline:", targetUserId);
      return;
    }

    console.log("📨 Forwarding WebRTC answer");
    console.log("From:", socket.userId);
    console.log("To:", targetUserId);

    io.to(targetSocketId).emit("webrtcAnswer", {
      receiverId: socket.userId,
      answer,
    });
  } catch (error) {
    console.error("❌ WebRTC answer error:", error);
  }
});


// ==========================================
// ICE CANDIDATE
// ==========================================
socket.on("iceCandidate", ({ targetUserId, candidate }) => {
  try {
    if (!targetUserId || !candidate) {
      console.error("❌ ICE candidate data missing");
      return;
    }

    const targetSocketId = connectedUsers.get(
      targetUserId.toString()
    );

    if (!targetSocketId) {
      console.log("❌ Target user is offline:", targetUserId);
      return;
    }

    console.log("🧊 Forwarding ICE candidate");

    io.to(targetSocketId).emit("iceCandidate", {
      senderId: socket.userId,
      candidate,
    });
  } catch (error) {
    console.error("❌ ICE candidate error:", error);
  }
});

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on(
      "disconnect",
      async () => {
        try {
          const userId =
            socket.userId;

          console.log(
            "Socket disconnected:",
            socket.id
          );

          if (!userId) {
            return;
          }

          // ==================================
          // MULTI TAB SAFETY
          // ==================================

          if (
            connectedUsers.get(
              userId
            ) !== socket.id
          ) {
            return;
          }

          // ==================================
          // REMOVE SOCKET
          // ==================================

          connectedUsers.delete(
            userId
          );

          const lastSeen =
            new Date();

          // ==================================
          // UPDATE USER OFFLINE
          // ==================================

          await User.findByIdAndUpdate(
            userId,
            {
              $set: {
                online: false,
                lastSeen,
              },
            }
          );

          console.log(
            `🔴 User ${userId} is offline`
          );

          // ==================================
          // INFORM OTHER USERS
          // ==================================

          socket.broadcast.emit(
            "userOffline",
            {
              userId,
              lastSeen,
            }
          );
        } catch (error) {
          console.error(
            "Socket disconnect error:",
            error
          );
        }
      }
    );
  });
};

// ==========================================
// GET SOCKET.IO INSTANCE
// ==========================================

const getIO = () => {
  if (!ioInstance) {
    throw new Error(
      "Socket.IO has not been initialized"
    );
  }

  return ioInstance;
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  setupSocket,
  getIO,
};
