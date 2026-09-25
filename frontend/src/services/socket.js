import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

// ==========================================
// CONNECT SOCKET
// ==========================================

export const connectSocket = (userId) => {
  if (!userId) {
    return;
  }

  const userIdString = userId.toString();

  // Remove previous connect listener
  socket.off("connect");

  // Join room only after connection is established
  socket.on("connect", () => {
    console.log(
      "Socket connected:",
      socket.id
    );

    socket.emit(
      "join",
      userIdString
    );

    console.log(
      "Joined socket room:",
      userIdString
    );
  });

  // Connect if not already connected
  if (!socket.connected) {
    socket.connect();
  } else {
    // Already connected
    socket.emit(
      "join",
      userIdString
    );
  }
};

// ==========================================
// DISCONNECT SOCKET
// ==========================================

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();

    console.log(
      "Socket disconnected"
    );
  }
};
