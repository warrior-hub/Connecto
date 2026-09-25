import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import VideoCall from "../components/call/VideoCall";
import AppNavigation from "../components/common/AppNavigation";

import { getUsers } from "../services/userService";

import {
  createPeerConnection,
  getPeerConnection,
  closePeerConnection,
} from "../services/webrtc";

import {
  getConversations,
  getMessages,
  startConversation,
  markMessagesAsRead,
} from "../services/messageService";

import {
  socket,
  connectSocket,
  disconnectSocket,
} from "../services/socket";

const Chat = () => {
  // =========================================================
  // AUTH
  // =========================================================

  const token = useSelector(
    (state) => state.auth.token
  );

  const user = useSelector(
    (state) => state.auth.user
  );

  const currentUserId =
    user?._id?.toString() ||
    user?.id?.toString();

  // =========================================================
  // CHAT STATE
  // =========================================================

  const [users, setUsers] = useState([]);

  const [conversations, setConversations] =
    useState([]);

  const [selectedChat, setSelectedChat] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [unreadCounts, setUnreadCounts] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  // =========================================================
  // INCOMING CALL
  // =========================================================

  const [incomingCall, setIncomingCall] =
    useState(null);

  // =========================================================
  // VIDEO CALL STATE
  // =========================================================

  const [localStream, setLocalStream] =
    useState(null);

  const [remoteStream, setRemoteStream] =
    useState(null);

  const [isInCall, setIsInCall] =
    useState(false);

  const [callingUser, setCallingUser] =
    useState(null);

  // =========================================================
  // WEBRTC REFS
  // =========================================================

  const pendingIceCandidatesRef =
    useRef([]);

  const pendingCallRef =
    useRef(null);

  const localStreamRef =
    useRef(null);

  const remoteStreamRef =
    useRef(null);

  const callingUserRef =
    useRef(null);

  const usersRef =
    useRef([]);

  // =========================================================
  // KEEP USERS REF UPDATED
  // =========================================================

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // =========================================================
  // HELPER: STOP STREAM
  // =========================================================

  const stopStream = (stream) => {
    if (!stream) {
      return;
    }

    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (error) {
        console.error(
          "Track stop error:",
          error
        );
      }
    });
  };

  // =========================================================
  // HELPER: COMPLETE CALL CLEANUP
  // =========================================================

  const cleanupCall = () => {
    console.log(
      "🧹 Cleaning complete call state"
    );

    stopStream(
      localStreamRef.current
    );

    stopStream(
      remoteStreamRef.current
    );

    localStreamRef.current = null;
    remoteStreamRef.current = null;

    callingUserRef.current = null;

    closePeerConnection();

    pendingIceCandidatesRef.current = [];

    pendingCallRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setCallingUser(null);
    setIsInCall(false);
    setIncomingCall(null);

    console.log(
      "✅ Call cleanup completed"
    );
  };

  // =========================================================
  // HELPER: SET CALLING USER
  // =========================================================

  const updateCallingUser = (nextUser) => {
    callingUserRef.current =
      nextUser || null;

    setCallingUser(
      nextUser || null
    );
  };

  // =========================================================
  // HELPER: SET LOCAL STREAM
  // =========================================================

  const updateLocalStream = (stream) => {
    localStreamRef.current =
      stream || null;

    setLocalStream(
      stream || null
    );
  };

  // =========================================================
  // HELPER: SET REMOTE STREAM
  // =========================================================

  const updateRemoteStream = (stream) => {
    remoteStreamRef.current =
      stream || null;

    setRemoteStream(
      stream || null
    );
  };

  // =========================================================
  // LOAD USERS
  // =========================================================

  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (!token) {
          setUsers([]);
          return;
        }

        if (!currentUserId) {
          console.warn(
            "Current user ID is missing"
          );

          setUsers([]);
          return;
        }

        const data =
          await getUsers(token);

        console.log(
          "GET USERS RESPONSE:",
          data
        );

        if (!data?.success) {
          console.error(
            "Get users failed:",
            data?.message
          );

          setUsers([]);
          return;
        }

        const allUsers =
          Array.isArray(data.users)
            ? data.users
            : [];

        const otherUsers =
          allUsers.filter(
            (item) =>
              item?._id?.toString() !==
              currentUserId
          );

        setUsers(otherUsers);
      } catch (error) {
        console.error(
          "Users error:",
          error.response?.data?.message ||
            error.message
        );

        setUsers([]);
      }
    };

    loadUsers();
  }, [
    token,
    currentUserId,
  ]);

  // =========================================================
  // SOCKET CONNECTION
  // =========================================================

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    connectSocket(currentUserId);

    return () => {
      disconnectSocket();
    };
  }, [currentUserId]);

  // =========================================================
  // LOAD CONVERSATIONS
  // =========================================================

  useEffect(() => {
    const loadConversations = async () => {
      try {
        if (!token) {
          setConversations([]);
          setLoading(false);
          return;
        }

        setLoading(true);

        const data =
          await getConversations(token);

        console.log(
          "GET CONVERSATIONS:",
          data
        );

        if (data?.success) {
          setConversations(
            Array.isArray(
              data.conversations
            )
              ? data.conversations
              : []
          );
        } else {
          setConversations([]);
        }
      } catch (error) {
        console.error(
          "Conversation error:",
          error.response?.data?.message ||
            error.message
        );

        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [token]);

  // =========================================================
  // REAL-TIME NEW MESSAGE
  // =========================================================

  useEffect(() => {
    const handleNewMessage = async (
      newMessage
    ) => {
      console.log(
        "NEW REAL-TIME MESSAGE:",
        newMessage
      );

      const conversationId =
        newMessage?.conversation?.toString();

      if (!conversationId) {
        return;
      }

      const messageId =
        newMessage?._id?.toString();

      const isCurrentChat =
        selectedChat?.conversationId?.toString() ===
        conversationId;

      // DELIVERY ACK
      if (messageId) {
        socket.emit(
          "messageDelivered",
          {
            messageId,
          }
        );
      }

      // CURRENT OPEN CHAT
      if (isCurrentChat) {
        setMessages((prev) => {
          const alreadyExists =
            prev.some(
              (message) =>
                message?._id?.toString() ===
                messageId
            );

          if (alreadyExists) {
            return prev;
          }

          return [
            ...prev,
            newMessage,
          ];
        });

        if (token) {
          try {
            await markMessagesAsRead(
              conversationId,
              token
            );
          } catch (error) {
            console.error(
              "Auto read error:",
              error.response?.data?.message ||
                error.message
            );
          }
        }

        return;
      }

      // OTHER CHAT
      setUnreadCounts((prev) => ({
        ...prev,
        [conversationId]:
          (prev[conversationId] || 0) +
          1,
      }));

      // UPDATE CONVERSATION
      setConversations((prev) => {
        const index =
          prev.findIndex(
            (conversation) =>
              conversation?._id?.toString() ===
              conversationId
          );

        if (index === -1) {
          return prev;
        }

        const updatedConversation = {
          ...prev[index],
          lastMessage:
            newMessage,
          lastMessageAt:
            newMessage.createdAt,
        };

        const newList = [
          ...prev,
        ];

        newList.splice(
          index,
          1
        );

        newList.unshift(
          updatedConversation
        );

        return newList;
      });
    };

    socket.on(
      "newMessage",
      handleNewMessage
    );

    return () => {
      socket.off(
        "newMessage",
        handleNewMessage
      );
    };
  }, [
    selectedChat?.conversationId,
    token,
  ]);

  // =========================================================
  // MESSAGE DELIVERED
  // =========================================================

  useEffect(() => {
    const handleMessageDelivered = ({
      messageId,
    }) => {
      if (!messageId) {
        return;
      }

      const targetId =
        messageId.toString();

      setMessages((prev) =>
        prev.map((message) => {
          if (
            message?._id?.toString() !==
            targetId
          ) {
            return message;
          }

          if (
            message.status === "read"
          ) {
            return message;
          }

          return {
            ...message,
            status: "delivered",
          };
        })
      );
    };

    socket.on(
      "messageDelivered",
      handleMessageDelivered
    );

    return () => {
      socket.off(
        "messageDelivered",
        handleMessageDelivered
      );
    };
  }, []);

  // =========================================================
  // MESSAGE READ
  // =========================================================

  useEffect(() => {
    const handleMessagesRead = ({
      conversationId,
      messageIds = [],
    }) => {
      if (!conversationId) {
        return;
      }

      const currentConversationId =
        selectedChat?.conversationId?.toString();

      if (
        currentConversationId !==
        conversationId.toString()
      ) {
        return;
      }

      const readIds = new Set(
        messageIds.map((id) =>
          id.toString()
        )
      );

      setMessages((prev) =>
        prev.map((message) => {
          if (
            !readIds.has(
              message?._id?.toString()
            )
          ) {
            return message;
          }

          return {
            ...message,
            status: "read",
            readAt:
              message.readAt ||
              new Date().toISOString(),
          };
        })
      );
    };

    socket.on(
      "messagesRead",
      handleMessagesRead
    );

    return () => {
      socket.off(
        "messagesRead",
        handleMessagesRead
      );
    };
  }, [
    selectedChat?.conversationId,
  ]);

  // =========================================================
  // REAL-TIME MESSAGE EDIT / DELETE
  // =========================================================

  useEffect(() => {
    // =========================================
    // MESSAGE EDITED
    // =========================================

    const handleMessageEdited = (
      updatedMessage
    ) => {
      console.log(
        "✏️ MESSAGE EDITED:",
        updatedMessage
      );

      if (!updatedMessage?._id) {
        return;
      }

      const messageId =
        updatedMessage._id.toString();

      const conversationId =
        updatedMessage.conversation?.toString();

      // Update current messages
      setMessages((prev) =>
        prev.map((message) =>
          message?._id?.toString() ===
          messageId
            ? updatedMessage
            : message
        )
      );

      // Update conversation preview
      if (conversationId) {
        setConversations((prev) =>
          prev.map(
            (conversation) => {
              if (
                conversation?._id?.toString() !==
                conversationId
              ) {
                return conversation;
              }

              if (
                conversation?.lastMessage?._id?.toString() !==
                messageId
              ) {
                return conversation;
              }

              return {
                ...conversation,
                lastMessage:
                  updatedMessage,
              };
            }
          )
        );
      }
    };

    // =========================================
    // MESSAGE DELETED
    // =========================================

    const handleMessageDeleted = (
      updatedMessage
    ) => {
      console.log(
        "🗑️ MESSAGE DELETED:",
        updatedMessage
      );

      if (!updatedMessage?._id) {
        return;
      }

      const messageId =
        updatedMessage._id.toString();

      const conversationId =
        updatedMessage.conversation?.toString();

      // Update current messages
      setMessages((prev) =>
        prev.map((message) =>
          message?._id?.toString() ===
          messageId
            ? updatedMessage
            : message
        )
      );

      // Update conversation preview
      if (conversationId) {
        setConversations((prev) =>
          prev.map(
            (conversation) => {
              if (
                conversation?._id?.toString() !==
                conversationId
              ) {
                return conversation;
              }

              if (
                conversation?.lastMessage?._id?.toString() !==
                messageId
              ) {
                return conversation;
              }

              return {
                ...conversation,
                lastMessage:
                  updatedMessage,
              };
            }
          )
        );
      }
    };

    socket.on(
      "messageEdited",
      handleMessageEdited
    );

    socket.on(
      "messageDeleted",
      handleMessageDeleted
    );

    return () => {
      socket.off(
        "messageEdited",
        handleMessageEdited
      );

      socket.off(
        "messageDeleted",
        handleMessageDeleted
      );
    };
  }, []);

  // =========================================================
  // UPDATE MESSAGE FROM MESSAGE BUBBLE
  // =========================================================

  const handleMessageUpdated = (
    updatedMessage
  ) => {
    if (!updatedMessage?._id) {
      return;
    }

    const messageId =
      updatedMessage._id.toString();

    const conversationId =
      updatedMessage.conversation?.toString();

    // Update currently opened messages
    setMessages((prev) =>
      prev.map((message) =>
        message?._id?.toString() ===
        messageId
          ? updatedMessage
          : message
      )
    );

    // Update conversation preview
    if (conversationId) {
      setConversations((prev) =>
        prev.map(
          (conversation) => {
            if (
              conversation?._id?.toString() !==
              conversationId
            ) {
              return conversation;
            }

            if (
              conversation?.lastMessage?._id?.toString() !==
              messageId
            ) {
              return conversation;
            }

            return {
              ...conversation,
              lastMessage:
                updatedMessage,
            };
          }
        )
      );
    }
  };

  // =========================================================
  // ONLINE / OFFLINE STATUS
  // =========================================================

  useEffect(() => {
    const updateUserStatus = (
      userId,
      online,
      lastSeen = null
    ) => {
      const id =
        userId?.toString();

      if (!id) {
        return;
      }

      // USERS
      setUsers((prev) =>
        prev.map((item) =>
          item?._id?.toString() === id
            ? {
                ...item,
                online,
                lastSeen,
              }
            : item
        )
      );

      // CONVERSATIONS
      setConversations((prev) =>
        prev.map(
          (conversation) => ({
            ...conversation,

            participants:
              Array.isArray(
                conversation.participants
              )
                ? conversation.participants.map(
                    (participant) =>
                      participant?._id?.toString() ===
                      id
                        ? {
                            ...participant,
                            online,
                            lastSeen,
                          }
                        : participant
                  )
                : [],
          })
        )
      );

      // SELECTED CHAT
      setSelectedChat((prev) => {
        if (
          !prev ||
          prev.userId?.toString() !==
            id
        ) {
          return prev;
        }

        return {
          ...prev,
          online,
          lastSeen,
        };
      });
    };

    const handleUserOnline = ({
      userId,
    }) => {
      updateUserStatus(
        userId,
        true,
        null
      );
    };

    const handleUserOffline = ({
      userId,
      lastSeen,
    }) => {
      updateUserStatus(
        userId,
        false,
        lastSeen ||
          new Date().toISOString()
      );
    };

    socket.on(
      "userOnline",
      handleUserOnline
    );

    socket.on(
      "userOffline",
      handleUserOffline
    );

    return () => {
      socket.off(
        "userOnline",
        handleUserOnline
      );

      socket.off(
        "userOffline",
        handleUserOffline
      );
    };
  }, []);

  // =========================================================
  // START WEBRTC CALL AFTER ACCEPT
  // =========================================================

  const startWebRTCCall = async (
    receiverId,
    receiverUser
  ) => {
    try {
      console.log(
        "🎥 STARTING WEBRTC CALL"
      );

      if (!receiverId) {
        console.error(
          "❌ Receiver ID missing"
        );
        return;
      }

      if (!socket.connected) {
        console.error(
          "❌ Socket is not connected"
        );
        return;
      }

      const normalizedReceiverId =
        receiverId.toString();

      const finalReceiverUser =
        receiverUser || {
          _id: normalizedReceiverId,
          name: "User",
        };

      pendingCallRef.current = {
        userId:
          normalizedReceiverId,
        user:
          finalReceiverUser,
      };

      updateCallingUser(
        finalReceiverUser
      );

      closePeerConnection();

      let stream =
        localStreamRef.current;

      if (
        !stream ||
        stream
          .getTracks()
          .every(
            (track) =>
              track.readyState ===
              "ended"
          )
      ) {
        console.log(
          "🎥 Caller stream missing. Requesting media..."
        );

        stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true,
            }
          );

        updateLocalStream(stream);
      } else {
        console.log(
          "✅ Reusing existing caller stream"
        );

        setLocalStream(stream);
      }

      setRemoteStream(null);

      setIsInCall(true);

      const pc =
        createPeerConnection(
          (candidate) => {
            console.log(
              "🧊 Caller sending ICE candidate"
            );

            socket.emit(
              "iceCandidate",
              {
                targetUserId:
                  normalizedReceiverId,
                candidate,
              }
            );
          },

          (remoteMediaStream) => {
            console.log(
              "🎥🎤 CALLER RECEIVED REMOTE STREAM"
            );

            remoteStreamRef.current =
              remoteMediaStream;

            setRemoteStream(
              remoteMediaStream
            );
          }
        );

      stream
        .getTracks()
        .forEach((track) => {
          console.log(
            "➕ Caller adding track:",
            track.kind
          );

          pc.addTrack(
            track,
            stream
          );
        });

      const offer =
        await pc.createOffer();

      console.log(
        "📨 Caller offer created"
      );

      await pc.setLocalDescription(
        offer
      );

      console.log(
        "📨 Caller local description set"
      );

      socket.emit(
        "webrtcOffer",
        {
          targetUserId:
            normalizedReceiverId,
          offer,
        }
      );

      console.log(
        "📨 WebRTC offer sent"
      );
    } catch (error) {
      console.error(
        "❌ WebRTC call failed:",
        error
      );

      cleanupCall();

      if (
        error?.name ===
        "NotAllowedError"
      ) {
        alert(
          "Camera/Microphone permission denied."
        );
      } else if (
        error?.name ===
        "NotFoundError"
      ) {
        alert(
          "Camera or microphone not found."
        );
      } else {
        alert(
          "Video call start nahi ho paayi."
        );
      }
    }
  };

  // =========================================================
  // CALL ACCEPTED
  // =========================================================

  useEffect(() => {
    const handleCallAccepted =
      async (data) => {
        try {
          console.log(
            "📞 CALL ACCEPTED"
          );

          const receiverId =
            data?.receiverId;

          if (!receiverId) {
            console.error(
              "❌ Receiver ID missing"
            );
            return;
          }

          const pendingCall =
            pendingCallRef.current;

          const receiverUser =
            pendingCall?.user || {
              _id:
                receiverId.toString(),
              name: "User",
            };

          await startWebRTCCall(
            receiverId,
            receiverUser
          );
        } catch (error) {
          console.error(
            "❌ Call accepted error:",
            error
          );
        }
      };

    socket.on(
      "callAccepted",
      handleCallAccepted
    );

    return () => {
      socket.off(
        "callAccepted",
        handleCallAccepted
      );
    };
  }, []);

  // =========================================================
  // CALL REJECTED
  // =========================================================

  useEffect(() => {
    const handleCallRejected = (
      data
    ) => {
      console.log(
        "📞 CALL REJECTED BY:",
        data?.userId
      );

      cleanupCall();

      alert(
        "Video call rejected"
      );
    };

    socket.on(
      "callRejected",
      handleCallRejected
    );

    return () => {
      socket.off(
        "callRejected",
        handleCallRejected
      );
    };
  }, []);

  // =========================================================
  // INCOMING VIDEO CALL
  // =========================================================

  useEffect(() => {
    const handleIncomingCall = (
      data
    ) => {
      console.log(
        "📲 INCOMING VIDEO CALL:",
        data
      );

      setIncomingCall({
        caller:
          data?.caller || null,

        callType:
          data?.callType ||
          "video",
      });
    };

    socket.on(
      "incomingCall",
      handleIncomingCall
    );

    return () => {
      socket.off(
        "incomingCall",
        handleIncomingCall
      );
    };
  }, []);

  // =========================================================
  // ACCEPT VIDEO CALL
  // =========================================================

  const handleAcceptCall = () => {
    if (
      !incomingCall?.caller?._id
    ) {
      console.error(
        "❌ Caller ID missing"
      );

      return;
    }

    if (!currentUserId) {
      console.error(
        "❌ Current user ID missing"
      );

      return;
    }

    const caller =
      incomingCall.caller;

    const callerId =
      caller._id.toString();

    console.log(
      "✅ ACCEPTING VIDEO CALL:",
      caller
    );

    updateCallingUser(
      caller
    );

    updateRemoteStream(null);

    setIsInCall(true);

    setIncomingCall(null);

    pendingIceCandidatesRef.current =
      [];

    socket.emit(
      "callAccepted",
      {
        callerId,
        receiverId:
          currentUserId,
      }
    );

    console.log(
      "📞 callAccepted emitted"
    );
  };

  // =========================================================
  // REJECT VIDEO CALL
  // =========================================================

  const handleRejectCall = () => {
    if (
      !incomingCall?.caller?._id
    ) {
      console.error(
        "❌ Caller ID missing"
      );

      return;
    }

    const callerId =
      incomingCall.caller._id.toString();

    console.log(
      "❌ REJECTING VIDEO CALL"
    );

    socket.emit(
      "callRejected",
      {
        callerId,
      }
    );

    setIncomingCall(null);

    pendingCallRef.current =
      null;

    pendingIceCandidatesRef.current =
      [];

    console.log(
      "❌ Incoming call rejected"
    );
  };

  // =========================================================
  // WEBRTC OFFER RECEIVED
  // =========================================================

  useEffect(() => {
    const handleWebRTCOffer =
      async (data) => {
        try {
          console.log(
            "📨 WEBRTC OFFER RECEIVED"
          );

          const {
            callerId,
            offer,
          } = data || {};

          if (
            !callerId ||
            !offer
          ) {
            console.error(
              "❌ Caller ID or offer missing"
            );

            return;
          }

          let stream =
            localStreamRef.current;

          if (
            !stream ||
            stream
              .getTracks()
              .every(
                (track) =>
                  track.readyState ===
                  "ended"
              )
          ) {
            console.log(
              "🎥 Requesting receiver camera + microphone..."
            );

            stream =
              await navigator.mediaDevices.getUserMedia(
                {
                  video: true,
                  audio: true,
                }
              );

            updateLocalStream(
              stream
            );
          } else {
            console.log(
              "✅ Reusing receiver local stream"
            );

            setLocalStream(stream);
          }

          const callerUser =
            callingUserRef.current ||
            usersRef.current.find(
              (item) =>
                item?._id?.toString() ===
                callerId.toString()
            );

          const finalCaller =
            callerUser || {
              _id: callerId,
              name: "User",
            };

          updateCallingUser(
            finalCaller
          );

          setIsInCall(true);

          closePeerConnection();

          const pc =
            createPeerConnection(
              (candidate) => {
                console.log(
                  "🧊 Receiver sending ICE candidate"
                );

                socket.emit(
                  "iceCandidate",
                  {
                    targetUserId:
                      callerId,
                    candidate,
                  }
                );
              },

              (remoteMediaStream) => {
                console.log(
                  "🎥🎤 RECEIVER GOT REMOTE STREAM"
                );

                remoteStreamRef.current =
                  remoteMediaStream;

                setRemoteStream(
                  remoteMediaStream
                );
              }
            );

          stream
            .getTracks()
            .forEach((track) => {
              console.log(
                "➕ Receiver adding track:",
                track.kind
              );

              pc.addTrack(
                track,
                stream
              );
            });

          await pc.setRemoteDescription(
            new RTCSessionDescription(
              offer
            )
          );

          console.log(
            "📨 Receiver remote offer set"
          );

          if (
            pendingIceCandidatesRef
              .current.length > 0
          ) {
            console.log(
              "🧊 Adding queued ICE:",
              pendingIceCandidatesRef
                .current.length
            );

            for (
              const candidate of
                pendingIceCandidatesRef.current
            ) {
              try {
                await pc.addIceCandidate(
                  new RTCIceCandidate(
                    candidate
                  )
                );
              } catch (error) {
                console.error(
                  "❌ Queued ICE error:",
                  error
                );
              }
            }

            pendingIceCandidatesRef.current =
              [];
          }

          const answer =
            await pc.createAnswer();

          console.log(
            "📤 Receiver answer created"
          );

          await pc.setLocalDescription(
            answer
          );

          console.log(
            "📤 Receiver local description set"
          );

          socket.emit(
            "webrtcAnswer",
            {
              targetUserId:
                callerId,
              answer,
            }
          );

          console.log(
            "📤 WebRTC answer sent"
          );
        } catch (error) {
          console.error(
            "❌ Error handling WebRTC offer:",
            error
          );

          cleanupCall();

          if (
            error?.name ===
            "NotAllowedError"
          ) {
            alert(
              "Camera/Microphone permission denied."
            );
          } else if (
            error?.name ===
            "NotFoundError"
          ) {
            alert(
              "Camera or microphone not found."
            );
          }
        }
      };

    socket.on(
      "webrtcOffer",
      handleWebRTCOffer
    );

    return () => {
      socket.off(
        "webrtcOffer",
        handleWebRTCOffer
      );
    };
  }, []);

  // =========================================================
  // WEBRTC ANSWER RECEIVED
  // =========================================================

  useEffect(() => {
    const handleWebRTCAnswer =
      async (data) => {
        try {
          console.log(
            "📥 WEBRTC ANSWER RECEIVED"
          );

          const {
            answer,
          } = data || {};

          if (!answer) {
            console.error(
              "❌ WebRTC answer missing"
            );

            return;
          }

          const pc =
            getPeerConnection();

          if (!pc) {
            console.error(
              "❌ PeerConnection not found"
            );

            return;
          }

          await pc.setRemoteDescription(
            new RTCSessionDescription(
              answer
            )
          );

          console.log(
            "✅ Remote answer set"
          );

          if (
            pendingIceCandidatesRef
              .current.length > 0
          ) {
            console.log(
              "🧊 Adding queued ICE:",
              pendingIceCandidatesRef
                .current.length
            );

            for (
              const candidate of
                pendingIceCandidatesRef.current
            ) {
              try {
                await pc.addIceCandidate(
                  new RTCIceCandidate(
                    candidate
                  )
                );
              } catch (error) {
                console.error(
                  "❌ ICE candidate error:",
                  error
                );
              }
            }

            pendingIceCandidatesRef.current =
              [];
          }

          console.log(
            "🎥 WebRTC negotiation completed"
          );
        } catch (error) {
          console.error(
            "❌ Error handling WebRTC answer:",
            error
          );
        }
      };

    socket.on(
      "webrtcAnswer",
      handleWebRTCAnswer
    );

    return () => {
      socket.off(
        "webrtcAnswer",
        handleWebRTCAnswer
      );
    };
  }, []);

  // =========================================================
  // ICE CANDIDATE RECEIVED
  // =========================================================

  useEffect(() => {
    const handleICECandidate =
      async (data) => {
        try {
          const {
            candidate,
          } = data || {};

          if (!candidate) {
            return;
          }

          const pc =
            getPeerConnection();

          if (!pc) {
            console.log(
              "🧊 PeerConnection not ready. Queueing ICE."
            );

            pendingIceCandidatesRef.current.push(
              candidate
            );

            return;
          }

          if (!pc.remoteDescription) {
            console.log(
              "🧊 Remote description not ready. Queueing ICE."
            );

            pendingIceCandidatesRef.current.push(
              candidate
            );

            return;
          }

          console.log(
            "🧊 ICE candidate received"
          );

          await pc.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );

          console.log(
            "✅ ICE candidate added"
          );
        } catch (error) {
          console.error(
            "❌ Error adding ICE candidate:",
            error
          );
        }
      };

    socket.on(
      "iceCandidate",
      handleICECandidate
    );

    return () => {
      socket.off(
        "iceCandidate",
        handleICECandidate
      );
    };
  }, []);

  // =========================================================
  // REMOTE USER ENDED CALL
  // =========================================================

  useEffect(() => {
    const handleRemoteEndCall = (
      data
    ) => {
      console.log(
        "🔴 REMOTE USER ENDED CALL"
      );

      console.log(
        "Remote user:",
        data?.userId
      );

      cleanupCall();

      console.log(
        "✅ Remote call completely closed"
      );
    };

    socket.on(
      "endCall",
      handleRemoteEndCall
    );

    return () => {
      socket.off(
        "endCall",
        handleRemoteEndCall
      );
    };
  }, []);

  // =========================================================
  // CLEANUP ON COMPONENT UNMOUNT
  // =========================================================

  useEffect(() => {
    return () => {
      console.log(
        "🧹 Cleaning WebRTC resources on unmount"
      );

      stopStream(
        localStreamRef.current
      );

      stopStream(
        remoteStreamRef.current
      );

      localStreamRef.current =
        null;

      remoteStreamRef.current =
        null;

      callingUserRef.current =
        null;

      closePeerConnection();

      pendingIceCandidatesRef.current =
        [];

      pendingCallRef.current =
        null;
    };
  }, []);

  // =========================================================
  // SELECT EXISTING CHAT
  // =========================================================

  const handleSelectChat = async (
    conversation
  ) => {
    try {
      if (!conversation?._id) {
        console.warn(
          "Conversation ID missing"
        );

        return;
      }

      if (!currentUserId) {
        console.warn(
          "Current user ID missing"
        );

        return;
      }

      if (!token) {
        console.warn(
          "Authentication token missing"
        );

        return;
      }

      const conversationId =
        conversation._id.toString();

      const participants =
        Array.isArray(
          conversation.participants
        )
          ? conversation.participants
          : [];

      const otherUser =
        participants.find(
          (participant) => {
            const participantId =
              participant?._id?.toString();

            return (
              participantId &&
              participantId !==
                currentUserId
            );
          }
        );

      if (!otherUser?._id) {
        console.error(
          "Other user not found"
        );

        return;
      }

      const otherUserId =
        otherUser._id.toString();

      if (
        otherUserId ===
        currentUserId
      ) {
        console.error(
          "Cannot select yourself"
        );

        return;
      }

      setSelectedChat({
        userId:
          otherUserId,

        name:
          otherUser.name || "",

        username:
          otherUser.username || "",

        profilePicture:
          otherUser.profilePicture ||
          "",

        online:
          Boolean(
            otherUser.online
          ),

        lastSeen:
          otherUser.lastSeen ||
          null,

        conversationId,
      });

      setUnreadCounts((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[
          conversationId
        ];

        return updated;
      });

      setMessages([]);

      setMessagesLoading(true);

      const data =
        await getMessages(
          conversationId,
          token
        );

      if (data?.success) {
        setMessages(
          Array.isArray(
            data.messages
          )
            ? data.messages
            : []
        );

        try {
          await markMessagesAsRead(
            conversationId,
            token
          );
        } catch (error) {
          console.error(
            "Mark read error:",
            error.response?.data
              ?.message ||
              error.message
          );
        }
      }
    } catch (error) {
      console.error(
        "Messages error:",
        error.response?.data?.message ||
          error.message
      );

      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // =========================================================
  // SELECT USER / START NEW CHAT
  // =========================================================

  const handleSelectUser = async (
    selectedUser
  ) => {
    try {
      if (!selectedUser?._id) {
        console.error(
          "Selected user ID missing"
        );

        return;
      }

      if (!currentUserId) {
        console.error(
          "Current user ID missing"
        );

        return;
      }

      if (!token) {
        console.error(
          "Authentication token missing"
        );

        return;
      }

      const selectedUserId =
        selectedUser._id.toString();

      if (
        selectedUserId ===
        currentUserId
      ) {
        console.error(
          "Cannot start chat with yourself"
        );

        return;
      }

      setMessages([]);

      setMessagesLoading(true);

      const response =
        await startConversation(
          selectedUserId,
          token
        );

      console.log(
        "START CONVERSATION RESPONSE:",
        response
      );

      if (!response?.success) {
        console.error(
          "Conversation creation failed:",
          response?.message
        );

        return;
      }

      const conversation =
        response.conversation;

      if (!conversation?._id) {
        console.error(
          "Conversation ID missing:",
          conversation
        );

        return;
      }

      const conversationId =
        conversation._id.toString();

      const newSelectedChat = {
        userId:
          selectedUserId,

        name:
          selectedUser.name ||
          "User",

        username:
          selectedUser.username ||
          "",

        profilePicture:
          selectedUser.profilePicture ||
          "",

        online:
          Boolean(
            selectedUser.online
          ),

        lastSeen:
          selectedUser.lastSeen ||
          null,

        conversationId,
      };

      setSelectedChat(
        newSelectedChat
      );

      setConversations((prev) => {
        const exists =
          prev.some(
            (item) =>
              item?._id?.toString() ===
              conversationId
          );

        if (exists) {
          return prev.map(
            (item) =>
              item?._id?.toString() ===
              conversationId
                ? conversation
                : item
          );
        }

        return [
          conversation,
          ...prev,
        ];
      });

      const messagesResponse =
        await getMessages(
          conversationId,
          token
        );

      if (
        messagesResponse?.success
      ) {
        setMessages(
          Array.isArray(
            messagesResponse.messages
          )
            ? messagesResponse.messages
            : []
        );

        try {
          await markMessagesAsRead(
            conversationId,
            token
          );
        } catch (error) {
          console.error(
            "Mark read error:",
            error.response?.data
              ?.message ||
              error.message
          );
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error(
        "SELECT USER ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  // =========================================================
  // MESSAGE SENT
  // =========================================================

  const handleMessageSent = (
    newMessage
  ) => {
    if (!newMessage?._id) {
      return;
    }

    const messageId =
      newMessage._id.toString();

    const conversationId =
      newMessage.conversation?.toString();

    setMessages((prev) => {
      const alreadyExists =
        prev.some(
          (message) =>
            message?._id?.toString() ===
            messageId
        );

      if (alreadyExists) {
        return prev;
      }

      return [
        ...prev,
        newMessage,
      ];
    });

    if (!conversationId) {
      return;
    }

    setConversations((prev) => {
      const index =
        prev.findIndex(
          (conversation) =>
            conversation?._id?.toString() ===
            conversationId
        );

      if (index === -1) {
        return prev;
      }

      const updatedConversation = {
        ...prev[index],

        lastMessage:
          newMessage,

        lastMessageAt:
          newMessage.createdAt,
      };

      const newList = [
        ...prev,
      ];

      newList.splice(
        index,
        1
      );

      newList.unshift(
        updatedConversation
      );

      return newList;
    });
  };

  // =========================================================
  // MOBILE BACK
  // =========================================================

  const handleBackToSidebar = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  // =========================================================
  // START VIDEO CALL
  // =========================================================

  const handleStartVideoCall =
    async (chat) => {
      try {
        console.log(
          "🎥 ========================="
        );

        console.log(
          "🎥 CALL BUTTON CLICKED"
        );

        console.log(
          "🎥 ========================="
        );

        if (isInCall) {
          console.log(
            "⚠️ Already in a call"
          );

          return;
        }

        if (!chat?.userId) {
          console.error(
            "❌ Receiver ID missing"
          );

          return;
        }

        if (!currentUserId) {
          console.error(
            "❌ Current user ID missing"
          );

          return;
        }

        if (!socket.connected) {
          console.error(
            "❌ Socket not connected"
          );

          alert(
            "Socket connection nahi hai."
          );

          return;
        }

        const receiverId =
          chat.userId.toString();

        const receiverUser = {
          _id: receiverId,

          name:
            chat.name ||
            "User",

          username:
            chat.username ||
            "",

          profilePicture:
            chat.profilePicture ||
            "",
        };

        pendingCallRef.current = {
          userId:
            receiverId,

          user:
            receiverUser,
        };

        updateCallingUser(
          receiverUser
        );

        console.log(
          "🎥 Requesting caller camera + microphone..."
        );

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true,
            }
          );

        console.log(
          "✅ Caller camera + microphone ready"
        );

        updateLocalStream(
          stream
        );

        updateRemoteStream(
          null
        );

        setIsInCall(true);

        socket.emit(
          "callUser",
          {
            receiverId,

            caller: {
              _id:
                currentUserId,

              name:
                user?.name ||
                "User",

              username:
                user?.username ||
                "",

              profilePicture:
                user?.profilePicture ||
                "",
            },
          }
        );

        console.log(
          "📞 callUser emitted"
        );
      } catch (error) {
        console.error(
          "❌ Start video call error:",
          error
        );

        cleanupCall();

        if (
          error?.name ===
          "NotAllowedError"
        ) {
          alert(
            "Camera/Microphone permission denied."
          );
        } else if (
          error?.name ===
          "NotFoundError"
        ) {
          alert(
            "Camera ya microphone nahi mila."
          );
        } else {
          alert(
            "Video call start nahi ho paayi."
          );
        }
      }
    };

  // =========================================================
  // END CALL
  // =========================================================

  const handleEndCall = () => {
    console.log(
      "🔴 END BUTTON CLICKED"
    );

    const otherUserId =
      callingUserRef.current?._id?.toString() ||
      pendingCallRef.current?.userId?.toString();

    if (
      otherUserId &&
      socket.connected
    ) {
      socket.emit(
        "endCall",
        {
          userId:
            otherUserId,
        }
      );

      console.log(
        "📡 endCall sent to:",
        otherUserId
      );
    }

    if (
      localStreamRef.current
    ) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      localStreamRef.current =
        null;
    }

    if (
      remoteStreamRef.current
    ) {
      remoteStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      remoteStreamRef.current =
        null;
    }

    closePeerConnection();

    pendingIceCandidatesRef.current =
      [];

    pendingCallRef.current =
      null;

    callingUserRef.current =
      null;

    setLocalStream(null);
    setRemoteStream(null);
    setCallingUser(null);
    setIncomingCall(null);

    setIsInCall(false);

    console.log(
      "✅ VIDEO CALL UI CLOSED"
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
  <div
  className="
    relative
    w-full
    h-[100dvh]
    min-h-[100dvh]
    bg-[#0b141a]
    text-white
    overflow-hidden
  "
>
  {/* =========================================
      NAVIGATION
  ========================================= */}
<div className={selectedChat ? "hidden md:block" : "block"}>
  <AppNavigation />
</div>

  {/* =========================================
      VIDEO CALL
  ========================================= */}

  {isInCall && (
    <VideoCall
      localStream={localStream}
      remoteStream={remoteStream}
      callingUser={callingUser}
      onEndCall={handleEndCall}
    />
  )}

  {/* =========================================
      INCOMING CALL POPUP
  ========================================= */}

  {incomingCall && (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-sm
        px-4
        py-6
      "
    >
      <div
        className="
          w-full
          max-w-sm
          max-h-[90dvh]
          overflow-y-auto
          bg-[#202c33]
          rounded-2xl
          shadow-2xl
          p-5
          sm:p-6
        "
      >
        <div className="text-center">

          {/* CALL TYPE */}

          <p
            className="
              text-[#8696a0]
              text-sm
              mb-4
            "
          >
            Incoming Video Call
          </p>

          {/* PROFILE */}

          <div className="flex justify-center mb-4">
            {incomingCall.caller?.profilePicture ? (
              <img
                src={incomingCall.caller.profilePicture}
                alt={
                  incomingCall.caller?.name || "Caller"
                }
                className="
                  w-20
                  h-20
                  sm:w-24
                  sm:h-24
                  rounded-full
                  object-cover
                  border-4
                  border-[#00a884]
                "
              />
            ) : (
              <div
                className="
                  w-20
                  h-20
                  sm:w-24
                  sm:h-24
                  rounded-full
                  bg-[#2a3942]
                  border-4
                  border-[#00a884]
                  flex
                  items-center
                  justify-center
                  text-2xl
                  sm:text-3xl
                  text-white
                  font-semibold
                "
              >
                {(
                  incomingCall.caller?.name || "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* CALLER NAME */}

          <h2
            className="
              text-lg
              sm:text-xl
              font-semibold
              text-white
              truncate
              px-2
            "
          >
            {incomingCall.caller?.name || "Someone"}
          </h2>

          <p
            className="
              text-sm
              text-[#8696a0]
              mt-1
            "
          >
            is calling you...
          </p>

          {/* BUTTONS */}

          <div
            className="
              flex
              items-center
              justify-center
              gap-5
              mt-6
              sm:mt-7
            "
          >
            {/* REJECT */}

            <button
              type="button"
              onClick={handleRejectCall}
              className="
                w-13
                h-13
                sm:w-14
                sm:h-14
                rounded-full
                bg-red-500
                hover:bg-red-600
                active:scale-95
                flex
                items-center
                justify-center
                text-white
                text-xl
                sm:text-2xl
                transition
                shadow-lg
              "
              title="Reject"
            >
              ✕
            </button>

            {/* ACCEPT */}

            <button
              type="button"
              onClick={handleAcceptCall}
              className="
                w-13
                h-13
                sm:w-14
                sm:h-14
                rounded-full
                bg-green-500
                hover:bg-green-600
                active:scale-95
                flex
                items-center
                justify-center
                text-white
                text-xl
                sm:text-2xl
                transition
                shadow-lg
              "
              title="Accept"
            >
              ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* =========================================
      MAIN APP AREA
  ========================================= */}

  <main
    className="
      relative
      w-full
      h-full
      min-h-0
      overflow-hidden

      md:pl-[72px]
      pb-0
    "
  >
    {/* =======================================
        MAIN FLEX CONTAINER
    ======================================= */}

    <div
      className="
        flex
        w-full
        h-full
        min-h-0
        overflow-hidden
      "
    >

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`
          shrink-0
          h-full
          min-h-0
          w-full
          md:w-[340px]
          lg:w-[380px]
          xl:w-[400px]

          border-r
          border-[#2a3942]
          bg-[#111b21]

          ${
            selectedChat
              ? "hidden md:block"
              : "block"
          }
        `}
      >
        <div className="h-full min-h-0 w-full overflow-hidden">
          <ChatSidebar
            conversations={conversations}
            users={users}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onSelectUser={handleSelectUser}
            unreadCounts={unreadCounts}
            loading={loading}
          />
        </div>
      </aside>

      {/* =====================================
          CHAT WINDOW
      ====================================== */}

      <section
        className={`
          flex-1
          min-w-0
          min-h-0
          h-full
          overflow-hidden

          ${
            selectedChat
              ? "block"
              : "hidden md:block"
          }
        `}
      >
        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          messagesLoading={messagesLoading}
          onMessageSent={handleMessageSent}
          onMessageUpdated={handleMessageUpdated}
          onBack={handleBackToSidebar}
          onStartVideoCall={handleStartVideoCall}
        //   onStartAudioCall={handleStartAudioCall}
        />
      </section>

    </div>
  </main>
</div>  
  );
};

export default Chat;