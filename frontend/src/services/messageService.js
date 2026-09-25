import api from "./api";

// ==========================================
// SEND MESSAGE
// ==========================================

export const sendMessage = async (
  receiverId,
  text,
  token,
  imageFile = null
) => {
  const formData = new FormData();

  formData.append(
    "receiverId",
    receiverId
  );

  formData.append(
    "text",
    text || ""
  );

  if (imageFile) {
    formData.append(
      "media",
      imageFile
    );
  }

  const response = await api.post(
    "/messages",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ==========================================
// GET ALL CONVERSATIONS
// ==========================================

export const getConversations = async (
  token
) => {
  const response = await api.get(
    "/messages/conversations",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ==========================================
// GET MESSAGES
// ==========================================

export const getMessages = async (
  conversationId,
  token
) => {
  const response = await api.get(
    `/messages/${conversationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ==========================================
// START / FIND CONVERSATION
// ==========================================

export const startConversation = async (
  userId,
  token
) => {
  const response = await api.post(
    "/messages/conversations",
    {
      userId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ==========================================
// MARK MESSAGES AS READ
// ==========================================

export const markMessagesAsRead = async (
  conversationId,
  token
) => {
  const response = await api.patch(
    `/messages/${conversationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const editMessage = async (
  messageId,
  text,
  token
) => {
  const response = await api.patch(
    `/messages/${messageId}`,
    {
      text,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


export const deleteMessage = async (
  messageId,
  token
) => {
  const response = await api.delete(
    `/messages/${messageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};