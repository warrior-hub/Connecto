const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// ==========================================
// GENERATE JWT TOKEN
// ==========================================

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==========================================
// REGISTER
// ==========================================

const register = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      phone,
      password,
    } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (
      !name ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required fields",
      });
    }

    // ========================================
    // NORMALIZE DATA
    // ========================================

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedUsername =
      username.trim().toLowerCase();

    // ========================================
    // CHECK EXISTING USER
    // ========================================

    const existingUser =
      await User.findOne({
        $or: [
          {
            email: normalizedEmail,
          },
          {
            username:
              normalizedUsername,
          },
        ],
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "User already exists",
      });
    }

    // ========================================
    // HASH PASSWORD
    // ========================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // ========================================
    // CREATE USER
    // ========================================

    const user = await User.create({
      name: name.trim(),

      username:
        normalizedUsername,

      email:
        normalizedEmail,

      phone:
        phone?.trim() || undefined,

      password:
        hashedPassword,

      online: true,

      lastSeen: null,
    });

    // ========================================
    // GENERATE TOKEN
    // ========================================

    const token =
      generateToken(user._id);

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully",

      token,

      user: {
        // IMPORTANT:
        // Frontend uses user._id
        _id: user._id,

        name: user.name,

        username:
          user.username,

        email:
          user.email,

        phone:
          user.phone,

        profilePicture:
          user.profilePicture,

        bio:
          user.bio,

        online:
          user.online,

        lastSeen:
          user.lastSeen,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    // MongoDB duplicate key
    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Username, email or phone already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // ========================================
    // NORMALIZE EMAIL
    // ========================================

    const normalizedEmail =
      email.trim().toLowerCase();

    // ========================================
    // FIND USER
    // ========================================

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ========================================
    // CHECK PASSWORD
    // ========================================

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ========================================
    // UPDATE ONLINE STATUS
    // ========================================

    user.online = true;
    user.lastSeen = null;

    await user.save();

    // ========================================
    // GENERATE TOKEN
    // ========================================

    const token =
      generateToken(user._id);

    // ========================================
    // RESPONSE
    // ========================================

    return res.json({
      success: true,

      message:
        "Login successful",

      token,

      user: {
        // IMPORTANT:
        // Frontend uses user._id
        _id: user._id,

        name: user.name,

        username:
          user.username,

        email:
          user.email,

        phone:
          user.phone,

        profilePicture:
          user.profilePicture,

        bio:
          user.bio,

        online:
          user.online,

        lastSeen:
          user.lastSeen,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================

const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  register,
  login,
  getMe,
};
