import api from "./api";

// ==========================================
// CREATE STATUS
// ==========================================

export const createStatus = async (
  formData,
  token
) => {
  const response = await api.post(
    "/status",
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
// GET MY STATUS
// ==========================================

export const getMyStatus = async (
  token
) => {
  const response = await api.get(
    "/status/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ==========================================
// GET OTHER USERS STATUS
// ==========================================

export const getOtherStatuses = async (
  token
) => {
  const response = await api.get(
    "/status",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const markStatusViewed = async (
  statusId,
  token
) => {
  const response = await api.patch(
    `/status/${statusId}/view`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


export const deleteStatus = async (
  statusId,
  token
) => {
  const response = await api.delete(
    `/status/${statusId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};