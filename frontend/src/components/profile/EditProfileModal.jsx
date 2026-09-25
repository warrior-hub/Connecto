import { useEffect, useRef, useState } from "react";
import {
  X,
  Save,
  UserRound,
  AtSign,
  Phone,
  FileText,
  Camera,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";

import { updateProfile } from "../../services/userService";
import Avatar from "../common/Avatar";

const EditProfileModal = ({ onClose, onUpdated }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    bio: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // LOAD CURRENT USER
  // =========================================

  useEffect(() => {
    if (!currentUser) return;

    setFormData({
      name: currentUser.name || "",
      username: currentUser.username || "",
      phone: currentUser.phone || "",
      bio: currentUser.bio || "",
    });

    setImagePreview(currentUser.profilePicture || "");
    setSelectedImage(null);
  }, [currentUser]);

  // =========================================
  // CLEANUP PREVIEW
  // =========================================

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // =========================================
  // INPUT CHANGE
  // =========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =========================================
  // IMAGE CHANGE
  // =========================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be less than 5MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
    setError("");

    event.target.value = "";
  };

  // =========================================
  // VALIDATION
  // =========================================

  const validateForm = () => {
    const name = formData.name.trim();
    const username = formData.username.trim().toLowerCase();
    const phone = formData.phone.trim();
    const bio = formData.bio.trim();

    if (!name) {
      return "Name is required.";
    }

    if (name.length < 2) {
      return "Name must be at least 2 characters.";
    }

    if (name.length > 50) {
      return "Name cannot exceed 50 characters.";
    }

    if (!username) {
      return "Username is required.";
    }

    if (username.length < 3) {
      return "Username must be at least 3 characters.";
    }

    if (username.length > 30) {
      return "Username cannot exceed 30 characters.";
    }

    const usernameRegex = /^[a-z0-9_]+$/;

    if (!usernameRegex.test(username)) {
      return "Username can contain only letters, numbers and underscore.";
    }

    if (phone) {
      const phoneRegex = /^[0-9+\-\s()]{7,15}$/;

      if (!phoneRegex.test(phone)) {
        return "Enter a valid phone number.";
      }
    }

    if (bio.length > 150) {
      return "Bio cannot exceed 150 characters.";
    }

    return "";
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const profileData = {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      };

      const data = await updateProfile(
        profileData,
        token,
        selectedImage
      );

      if (data?.success && data?.user) {
        onUpdated?.(data.user);
        onClose?.();
        return;
      }

      setError(data?.message || "Profile update failed.");
    } catch (error) {
      console.error("Update profile error:", error);

      const serverMessage = error?.response?.data?.message;

      if (serverMessage) {
        setError(serverMessage);
      } else if (error?.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Unable to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // MODAL
  // =========================================

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/70 backdrop-blur-[2px]
        p-3 sm:p-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-md
          max-h-[92vh]
          flex flex-col
          overflow-hidden
          rounded-2xl
          bg-[#202c33]
          border border-[#2a3942]
          shadow-2xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div
          className="
            shrink-0
            flex items-center justify-between
            px-4 sm:px-5
            py-3
            border-b border-[#2a3942]
          "
        >
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Edit Profile
            </h2>

            <p className="text-[11px] text-[#8696a0] mt-0.5">
              Update your profile information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="
              w-9 h-9
              flex items-center justify-center
              rounded-full
              text-[#aebac1]
              hover:text-white
              hover:bg-[#2a3942]
              transition
              disabled:opacity-40
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="
            flex-1
            overflow-y-auto
            px-4 sm:px-5
            py-4
            scrollbar-thin
            scrollbar-thumb-[#374045]
          "
        >
          {/* PROFILE PICTURE */}

          <div className="flex items-center gap-4 mb-5">
            <div className="relative shrink-0">
              {/* SMALL AVATAR */}

              <div
                className="
                  w-[72px] h-[72px]
                  sm:w-[76px] sm:h-[76px]
                  rounded-full
                  overflow-hidden
                  bg-[#2a3942]
                  border-2 border-[#3b4a50]
                "
              >
                <Avatar
                  src={imagePreview}
                  name={formData.name}
                  size="lg"
                />
              </div>

              {/* CAMERA */}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                aria-label="Change profile picture"
                title="Change profile picture"
                className="
                  absolute
                  -right-1
                  -bottom-1
                  w-8
                  h-8
                  rounded-full
                  flex items-center justify-center
                  bg-green-500
                  text-black
                  border-[3px]
                  border-[#202c33]
                  hover:bg-green-400
                  transition
                  disabled:opacity-50
                "
              >
                <Camera size={15} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-white">
                Profile picture
              </p>

              <p className="text-xs text-[#8696a0] mt-1 leading-5">
                Click the camera icon to change your photo.
              </p>

              <p className="text-[10px] text-[#667781] mt-0.5">
                JPG, PNG or WEBP · Max 5MB
              </p>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div
              role="alert"
              className="
                mb-4
                px-3 py-2.5
                rounded-lg
                bg-red-500/10
                border border-red-500/20
                text-red-400
                text-xs sm:text-sm
              "
            >
              {error}
            </div>
          )}

          {/* NAME */}

          <div className="mb-3.5">
            <label
              htmlFor="profile-name"
              className="block text-xs font-medium text-[#d1d7db] mb-1.5"
            >
              Name
            </label>

            <div
              className="
                flex items-center gap-3
                px-3
                rounded-xl
                bg-[#111b21]
                border border-[#2a3942]
                focus-within:border-green-500/70
                transition
              "
            >
              <UserRound
                size={17}
                className="text-[#8696a0] shrink-0"
              />

              <input
                id="profile-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
                autoComplete="name"
                placeholder="Enter your name"
                disabled={loading}
                className="
                  flex-1 min-w-0
                  bg-transparent
                  text-white text-sm
                  py-2.5
                  outline-none
                  placeholder:text-[#8696a0]
                "
              />
            </div>
          </div>

          {/* USERNAME */}

          <div className="mb-3.5">
            <label
              htmlFor="profile-username"
              className="block text-xs font-medium text-[#d1d7db] mb-1.5"
            >
              Username
            </label>

            <div
              className="
                flex items-center gap-3
                px-3
                rounded-xl
                bg-[#111b21]
                border border-[#2a3942]
                focus-within:border-green-500/70
                transition
              "
            >
              <AtSign
                size={17}
                className="text-[#8696a0] shrink-0"
              />

              <input
                id="profile-username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                maxLength={30}
                autoComplete="username"
                placeholder="Enter username"
                disabled={loading}
                className="
                  flex-1 min-w-0
                  bg-transparent
                  text-white text-sm
                  py-2.5
                  outline-none
                  placeholder:text-[#8696a0]
                "
              />
            </div>

            <p className="mt-1 text-[10px] text-[#8696a0]">
              Letters, numbers and underscore only
            </p>
          </div>

          {/* PHONE */}

          <div className="mb-3.5">
            <label
              htmlFor="profile-phone"
              className="block text-xs font-medium text-[#d1d7db] mb-1.5"
            >
              Phone
            </label>

            <div
              className="
                flex items-center gap-3
                px-3
                rounded-xl
                bg-[#111b21]
                border border-[#2a3942]
                focus-within:border-green-500/70
                transition
              "
            >
              <Phone
                size={17}
                className="text-[#8696a0] shrink-0"
              />

              <input
                id="profile-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={15}
                autoComplete="tel"
                placeholder="Enter phone number"
                disabled={loading}
                className="
                  flex-1 min-w-0
                  bg-transparent
                  text-white text-sm
                  py-2.5
                  outline-none
                  placeholder:text-[#8696a0]
                "
              />
            </div>
          </div>

          {/* BIO */}

          <div className="mb-1">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="profile-bio"
                className="text-xs font-medium text-[#d1d7db]"
              >
                Bio
              </label>

              <span
                className={`
                  text-[10px]
                  ${
                    formData.bio.length >= 140
                      ? "text-yellow-400"
                      : "text-[#8696a0]"
                  }
                `}
              >
                {formData.bio.length}/150
              </span>
            </div>

            <div
              className="
                flex items-start gap-3
                px-3
                rounded-xl
                bg-[#111b21]
                border border-[#2a3942]
                focus-within:border-green-500/70
                transition
              "
            >
              <FileText
                size={17}
                className="text-[#8696a0] mt-3 shrink-0"
              />

              <textarea
                id="profile-bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength={150}
                rows={2}
                placeholder="Write something about yourself..."
                disabled={loading}
                className="
                  flex-1 min-w-0
                  bg-transparent
                  text-white text-sm
                  leading-5
                  py-2.5
                  outline-none
                  resize-none
                  placeholder:text-[#8696a0]
                "
              />
            </div>
          </div>

          {/* BUTTONS */}

          <div
            className="
              flex flex-col-reverse sm:flex-row
              gap-2.5
              mt-5
              pt-4
              border-t border-[#2a3942]
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                flex-1
                min-h-10
                rounded-xl
                border border-[#3b4a50]
                text-[#d1d7db]
                text-sm
                font-medium
                hover:bg-[#2a3942]
                hover:text-white
                transition
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                flex-1
                min-h-10
                flex items-center justify-center gap-2
                rounded-xl
                bg-green-500
                text-black
                text-sm
                font-semibold
                hover:bg-green-400
                active:bg-green-300
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;