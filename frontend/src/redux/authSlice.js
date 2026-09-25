import { createSlice } from "@reduxjs/toolkit";

// =========================================
// GET STORED USER
// =========================================

const getStoredUser = () => {
  try {
    const storedUser =
      localStorage.getItem(
        "vibetalk_user"
      );

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Stored user parse error:",
      error
    );

    localStorage.removeItem(
      "vibetalk_user"
    );

    return null;
  }
};

// =========================================
// GET STORED TOKEN
// =========================================

const getStoredToken = () => {
  return localStorage.getItem(
    "vibetalk_token"
  );
};

// =========================================
// INITIAL STATE
// =========================================

const storedToken = getStoredToken();

const initialState = {
  user: getStoredUser(),
  token: storedToken,
  isAuthenticated: Boolean(
    storedToken
  ),
};

// =========================================
// AUTH SLICE
// =========================================

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    // =====================================
    // LOGIN / REGISTER
    // =====================================

    setCredentials: (
      state,
      action
    ) => {
      const {
        token,
        user,
      } = action.payload;

      state.token = token || null;

      state.user = user || null;

      state.isAuthenticated =
        Boolean(token);

      // Save token
      if (token) {
        localStorage.setItem(
          "vibetalk_token",
          token
        );
      }

      // Save user
      if (user) {
        localStorage.setItem(
          "vibetalk_user",
          JSON.stringify(user)
        );
      }
    },

    // =====================================
    // UPDATE USER
    // =====================================

    updateUser: (
      state,
      action
    ) => {
      if (!state.user) {
        return;
      }

      state.user = {
        ...state.user,
        ...action.payload,
      };

      // Keep localStorage updated
      localStorage.setItem(
        "vibetalk_user",
        JSON.stringify(
          state.user
        )
      );
    },

    // =====================================
    // LOGOUT
    // =====================================

    logout: (state) => {
      state.user = null;

      state.token = null;

      state.isAuthenticated =
        false;

      localStorage.removeItem(
        "vibetalk_token"
      );

      localStorage.removeItem(
        "vibetalk_user"
      );
    },
  },
});

// =========================================
// EXPORT ACTIONS
// =========================================

export const {
  setCredentials,
  updateUser,
  logout,
} = authSlice.actions;

// =========================================
// EXPORT REDUCER
// =========================================

export default authSlice.reducer;
