const Status = require("../models/Status");


// =========================================
// CREATE STATUS
// =========================================

const createStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      type = "text",
      text = "",
      mediaUrl = "",
      backgroundColor = "#005c4b",
    } = req.body;


    // =====================================
    // ALLOWED TYPES
    // =====================================

    const allowedTypes = [
      "text",
      "image",
      "video",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status type",
      });
    }


    // =====================================
    // TEXT STATUS
    // =====================================

    if (type === "text") {
      if (!text.trim()) {
        return res.status(400).json({
          success: false,
          message: "Text is required",
        });
      }
    }


    // =====================================
    // IMAGE STATUS
    // =====================================

    if (type === "image") {

      // New uploaded image
      if (req.file) {
        // Cloudinary URL will be used
      }

      // Old/external URL support
      else if (!mediaUrl.trim()) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }
    }


    // =====================================
    // VIDEO STATUS
    // =====================================

    if (type === "video") {
      if (!mediaUrl.trim()) {
        return res.status(400).json({
          success: false,
          message: "Video URL is required",
        });
      }
    }


    // =====================================
    // MEDIA URL
    // =====================================

    let finalMediaUrl = "";

    if (type === "image") {

      if (req.file) {
        finalMediaUrl =
          req.file.path;
      } else {
        finalMediaUrl =
          mediaUrl.trim();
      }
    }


    if (type === "video") {
      finalMediaUrl =
        mediaUrl.trim();
    }


    // =====================================
    // 24 HOURS EXPIRY
    // =====================================

    const expiresAt = new Date(
      Date.now() +
        24 * 60 * 60 * 1000
    );


    // =====================================
    // CREATE STATUS
    // =====================================

    const status =
      await Status.create({
        user: userId,

        type,

        text:
          type === "text"
            ? text.trim()
            : "",

        mediaUrl:
          finalMediaUrl,

        backgroundColor,

        expiresAt,
      });


    // =====================================
    // POPULATE OWNER
    // =====================================

    const populatedStatus =
      await Status.findById(
        status._id
      ).populate(
        "user",
        "name username profilePicture"
      );


    // =====================================
    // RESPONSE
    // =====================================

    return res.status(201).json({
      success: true,

      message:
        "Status created successfully",

      status: populatedStatus,
    });

  } catch (error) {

    console.error(
      "Create status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =========================================
// GET MY STATUS
// =========================================

const getMyStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const statuses =
      await Status.find({
        user: userId,

        expiresAt: {
          $gt: new Date(),
        },
      })
        .populate(
          "user",
          "name username profilePicture"
        )
        .populate(
          "viewers.user",
          "name username profilePicture"
        )
        .sort({
          createdAt: 1,
        });


    return res.status(200).json({
      success: true,
      statuses,
    });

  } catch (error) {

    console.error(
      "Get my status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =========================================
// GET OTHER USERS STATUS
// =========================================

const getOtherStatuses = async (
  req,
  res
) => {
  try {

    const currentUserId =
      req.user._id;


    const statuses =
      await Status.find({
        user: {
          $ne: currentUserId,
        },

        expiresAt: {
          $gt: new Date(),
        },
      })
        .populate(
          "user",
          "name username profilePicture"
        )
        .sort({
          createdAt: 1,
        });


    const groupedStatuses = {};


    statuses.forEach((status) => {

      const statusUserId =
        status.user._id.toString();


      if (
        !groupedStatuses[
          statusUserId
        ]
      ) {

        groupedStatuses[
          statusUserId
        ] = {
          user: status.user,
          statuses: [],
        };
      }


      // ===================================
      // CHECK VIEWED
      // ===================================

      const viewed =
        status.viewers.some(
          (viewer) =>
            viewer.user?.toString() ===
            currentUserId.toString()
        );


      groupedStatuses[
        statusUserId
      ].statuses.push({
        ...status.toObject(),

        viewed,
      });
    });


    return res.status(200).json({
      success: true,

      users:
        Object.values(
          groupedStatuses
        ),
    });

  } catch (error) {

    console.error(
      "Get other statuses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =========================================
// MARK STATUS VIEWED
// =========================================

const markStatusViewed = async (
  req,
  res
) => {

  try {

    const currentUserId =
      req.user._id;

    const {
      statusId,
    } = req.params;


    // =====================================
    // VALIDATION
    // =====================================

    if (!statusId) {
      return res.status(400).json({
        success: false,
        message: "Status ID is required",
      });
    }


    // =====================================
    // FIND STATUS
    // =====================================

    const status =
      await Status.findOne({
        _id: statusId,

        expiresAt: {
          $gt: new Date(),
        },
      });


    if (!status) {
      return res.status(404).json({
        success: false,
        message:
          "Status not found or expired",
      });
    }


    // =====================================
    // OWN STATUS
    // =====================================

    if (
      status.user.toString() ===
      currentUserId.toString()
    ) {

      return res.status(200).json({
        success: true,

        message:
          "Own status does not need view tracking",
      });
    }


    // =====================================
    // ALREADY VIEWED
    // =====================================

    const alreadyViewed =
      status.viewers.some(
        (viewer) =>
          viewer.user?.toString() ===
          currentUserId.toString()
      );


    if (alreadyViewed) {

      return res.status(200).json({
        success: true,

        message:
          "Status already viewed",
      });
    }


    // =====================================
    // ADD VIEWER
    // =====================================

    status.viewers.push({
      user: currentUserId,

      viewedAt:
        new Date(),
    });


    // =====================================
    // REMOVE DUPLICATES
    // =====================================

    const uniqueViewers = [];

    const seenUsers =
      new Set();


    for (
      const viewer of status.viewers
    ) {

      const viewerId =
        viewer.user?.toString();


      if (!viewerId) {
        continue;
      }


      if (
        seenUsers.has(viewerId)
      ) {
        continue;
      }


      seenUsers.add(
        viewerId
      );

      uniqueViewers.push(
        viewer
      );
    }


    status.viewers =
      uniqueViewers;


    // =====================================
    // SAVE
    // =====================================

    await status.save();


    return res.status(200).json({
      success: true,

      message:
        "Status marked as viewed",
    });

  } catch (error) {

    console.error(
      "Mark status viewed error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteStatus = async (req, res) => {
  try {
    const { statusId } = req.params;

    const userId = req.user._id;

    // Find status
    const status = await Status.findById(
      statusId
    );

    if (!status) {
      return res.status(404).json({
        success: false,
        message: "Status not found",
      });
    }

    // Only owner can delete
    if (
      status.user.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own status",
      });
    }

    // Delete from MongoDB
    await Status.findByIdAndDelete(
      statusId
    );

    return res.json({
      success: true,
      message: "Status deleted successfully",
      statusId,
    });
  } catch (error) {
    console.error(
      "Delete status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================================
// EXPORTS
// =========================================

module.exports = {
  createStatus,
  getMyStatus,
  getOtherStatuses,
  markStatusViewed,
   deleteStatus,
};