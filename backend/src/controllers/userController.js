const User = require("../models/User");


// ==========================================
// GET USERS
// ==========================================

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: {
        $ne: req.user._id,
      },
    })
      .select(
        "name username profilePicture bio online lastSeen"
      )
      .sort({
        name: 1,
      });

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error(
      "Get users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==========================================
// UPDATE PROFILE
// ==========================================

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      name,
      username,
      phone,
      bio,
    } = req.body;


    // --------------------------------------
    // VALIDATION
    // --------------------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }


    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }


    // --------------------------------------
    // CLEAN DATA
    // --------------------------------------

    const cleanName =
      name.trim();

    const cleanUsername =
      username
        .trim()
        .toLowerCase();

    const cleanPhone =
      phone?.trim() || "";

    const cleanBio =
      bio?.trim() || "";


    // --------------------------------------
    // CHECK USERNAME
    // --------------------------------------

    const existingUsername =
      await User.findOne({
        username: cleanUsername,

        _id: {
          $ne: userId,
        },
      });


    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }


    // --------------------------------------
    // CHECK PHONE
    // --------------------------------------

    if (cleanPhone) {
      const existingPhone =
        await User.findOne({
          phone: cleanPhone,

          _id: {
            $ne: userId,
          },
        });


      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number already exists",
        });
      }
    }


    // --------------------------------------
    // DATA TO UPDATE
    // --------------------------------------

    const updateData = {
      name: cleanName,
      username: cleanUsername,
      phone: cleanPhone,
      bio: cleanBio,
    };


    // --------------------------------------
    // PROFILE PICTURE
    // --------------------------------------

    if (req.file) {
      updateData.profilePicture =
        req.file.path;
    }


    // --------------------------------------
    // UPDATE USER
    // --------------------------------------

    const updatedUser =
      await User.findByIdAndUpdate(
        userId,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");


    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // --------------------------------------
    // RESPONSE
    // --------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Profile updated successfully",

      user: updatedUser,
    });

  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );


    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  getUsers,
  updateProfile,
};