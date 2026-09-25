import { useEffect, useRef, useState } from "react";
import {
  X,
  Send,
  Image as ImageIcon,
  Type,
  Loader2,
  Check,
} from "lucide-react";
import { useSelector } from "react-redux";

import { createStatus } from "../../services/statusService";

const backgroundColors = [
  "#005c4b",
  "#1d4ed8",
  "#7c3aed",
  "#be123c",
  "#b45309",
  "#0f766e",
  "#334155",
  "#111827",
];

const CreateStatusModal = ({ onClose, onCreated }) => {
  const token = useSelector((state) => state.auth.token);

  const [text, setText] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#005c4b");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [statusType, setStatusType] = useState("text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // ========================================
  // CLEANUP IMAGE PREVIEW
  // ========================================

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ========================================
  // IMAGE SELECT
  // ========================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
    setStatusType("image");
    setError("");

    event.target.value = "";
  };

  // ========================================
  // REMOVE IMAGE
  // ========================================

  const handleRemoveImage = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");
    setStatusType("text");
    setError("");
  };

  // ========================================
  // SWITCH TYPE
  // ========================================

  const handleTypeChange = (type) => {
    if (loading) return;

    setStatusType(type);
    setError("");

    if (type === "text") {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setSelectedImage(null);
      setImagePreview("");
    }
  };

  // ========================================
  // CREATE STATUS
  // ========================================

  const handleCreate = async () => {
    const trimmedText = text.trim();

    if (statusType === "text" && !trimmedText) {
      setError("Please write something.");
      return;
    }

    if (statusType === "image" && !selectedImage) {
      setError("Please select an image.");
      return;
    }

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("type", statusType);
      formData.append("text", trimmedText);
      formData.append("backgroundColor", backgroundColor);

      if (selectedImage) {
        formData.append("media", selectedImage);
      }

      const data = await createStatus(formData, token);

      if (data?.success) {
        onCreated?.(data.status);
        onClose?.();
        return;
      }

      setError(data?.message || "Unable to create status.");
    } catch (error) {
      console.error("Create status error:", error);

      setError(
        error?.response?.data?.message ||
          "Unable to create status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/75
        backdrop-blur-sm
        p-3 sm:p-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-[480px]
          max-h-[94vh]
          flex flex-col
          overflow-hidden
          rounded-2xl
          bg-[#202c33]
          border border-[#2a3942]
          shadow-2xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* ========================================
            HEADER
        ======================================== */}

        <div
          className="
            shrink-0
            flex items-center justify-between
            px-4 sm:px-5
            py-3.5
            border-b border-[#2a3942]
          "
        >
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Create Status
            </h2>

            <p className="text-[11px] sm:text-xs text-[#8696a0] mt-0.5">
              Share a photo or write something
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            title="Close"
            className="
              shrink-0
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

        {/* ========================================
            CONTENT
        ======================================== */}

        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
            px-4 sm:px-5
            py-4
            scrollbar-thin
            scrollbar-thumb-[#374045]
            scrollbar-track-transparent
          "
        >
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

          {/* ========================================
              TYPE SWITCH
          ======================================== */}

          <div
            className="
              grid grid-cols-2
              gap-1
              p-1
              mb-4
              rounded-xl
              bg-[#111b21]
              border border-[#2a3942]
            "
          >
            <button
              type="button"
              onClick={() => handleTypeChange("text")}
              disabled={loading}
              className={`
                flex items-center justify-center
                gap-2
                py-2.5
                rounded-lg
                text-sm
                font-medium
                transition
                ${
                  statusType === "text"
                    ? "bg-[#2a3942] text-white shadow-sm"
                    : "text-[#8696a0] hover:text-white"
                }
              `}
            >
              <Type size={17} />
              Text
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("image")}
              disabled={loading}
              className={`
                flex items-center justify-center
                gap-2
                py-2.5
                rounded-lg
                text-sm
                font-medium
                transition
                ${
                  statusType === "image"
                    ? "bg-[#2a3942] text-white shadow-sm"
                    : "text-[#8696a0] hover:text-white"
                }
              `}
            >
              <ImageIcon size={17} />
              Photo
            </button>
          </div>

          {/* ========================================
              STATUS PREVIEW
          ======================================== */}

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[#aebac1]">
                Preview
              </p>

              {statusType === "image" && imagePreview && (
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <Check size={12} />
                  Photo selected
                </span>
              )}
            </div>

            <div
              className="
                relative
                w-full
                h-[300px]
                sm:h-[340px]
                rounded-2xl
                overflow-hidden
                border border-[#2a3942]
                bg-[#111b21]
                flex items-center justify-center
              "
              style={
                statusType === "text"
                  ? { backgroundColor }
                  : undefined
              }
            >
              {/* IMAGE PREVIEW */}

              {statusType === "image" && imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Selected status preview"
                    className="
                      w-full
                      h-full
                      object-contain
                      bg-[#111b21]
                    "
                  />

                  {/* IMAGE OVERLAY */}

                  <div
                    className="
                      absolute
                      inset-x-0
                      bottom-0
                      p-3
                      bg-gradient-to-t
                      from-black/70
                      via-black/20
                      to-transparent
                      pointer-events-none
                    "
                  >
                    {text.trim() && (
                      <p className="text-white text-sm text-center line-clamp-3">
                        {text}
                      </p>
                    )}
                  </div>

                  {/* REMOVE IMAGE */}

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    aria-label="Remove image"
                    title="Remove image"
                    className="
                      absolute
                      top-3
                      right-3
                      w-9 h-9
                      flex items-center justify-center
                      rounded-full
                      bg-black/65
                      text-white
                      border border-white/10
                      hover:bg-red-500
                      transition
                      disabled:opacity-50
                    "
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                /* TEXT PREVIEW */

                <p
                  className="
                    max-w-[90%]
                    px-6
                    text-white
                    text-xl sm:text-2xl
                    font-semibold
                    text-center
                    leading-relaxed
                    break-words
                    whitespace-pre-wrap
                  "
                >
                  {text.trim() || "Write your status..."}
                </p>
              )}
            </div>
          </div>

          {/* ========================================
              PHOTO PICKER
          ======================================== */}

          {statusType === "image" && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="
                  w-full
                  min-h-11
                  flex items-center justify-center
                  gap-2
                  rounded-xl
                  border border-[#3b4a50]
                  bg-[#111b21]
                  text-[#d1d7db]
                  text-sm
                  font-medium
                  hover:bg-[#2a3942]
                  hover:text-white
                  transition
                  disabled:opacity-50
                "
              >
                <ImageIcon size={18} />

                {selectedImage
                  ? "Change Photo"
                  : "Choose Photo"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <p className="text-[10px] text-[#667781] text-center mt-2">
                JPG, PNG or WEBP · Maximum 10MB
              </p>
            </div>
          )}

          {/* ========================================
              TEXT / CAPTION
          ======================================== */}

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#d1d7db]">
                {statusType === "image"
                  ? "Caption"
                  : "Your status"}
              </label>

              <span className="text-[10px] text-[#8696a0]">
                {text.length}/1000
              </span>
            </div>

            <textarea
              value={text}
              onChange={(event) => {
                setText(
                  event.target.value.slice(0, 1000)
                );

                if (error) {
                  setError("");
                }
              }}
              placeholder={
                statusType === "image"
                  ? "Add a caption (optional)..."
                  : "Type a status..."
              }
              rows={3}
              disabled={loading}
              className="
                w-full
                min-h-[82px]
                bg-[#111b21]
                border border-[#2a3942]
                rounded-xl
                px-3.5
                py-3
                text-sm
                leading-5
                text-white
                outline-none
                resize-none
                placeholder:text-[#667781]
                focus:border-green-500/60
                focus:ring-1
                focus:ring-green-500/20
                transition
                disabled:opacity-50
              "
            />
          </div>

          {/* ========================================
              BACKGROUND COLORS
          ======================================== */}

          {statusType === "text" && (
            <div className="mb-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-[#aebac1]">
                  Background
                </p>

                <span className="text-[10px] text-[#667781]">
                  Choose a color
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {backgroundColors.map((color) => {
                  const selected =
                    backgroundColor === color;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setBackgroundColor(color)
                      }
                      disabled={loading}
                      aria-label={`Select background ${color}`}
                      title="Select background"
                      className={`
                        relative
                        w-9 h-9
                        rounded-full
                        transition
                        hover:scale-105
                        disabled:opacity-50
                        ${
                          selected
                            ? "ring-2 ring-white ring-offset-2 ring-offset-[#202c33]"
                            : ""
                        }
                      `}
                      style={{
                        backgroundColor: color,
                      }}
                    >
                      {selected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check
                            size={15}
                            className="text-white"
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================
            FOOTER
        ======================================== */}

        <div
          className="
            shrink-0
            flex items-center justify-end
            gap-2
            px-4 sm:px-5
            py-3
            border-t border-[#2a3942]
            bg-[#202c33]
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              min-h-10
              px-4
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
            type="button"
            onClick={handleCreate}
            disabled={
              loading ||
              (statusType === "text" &&
                !text.trim()) ||
              (statusType === "image" &&
                !selectedImage)
            }
            className="
              min-h-10
              px-4 sm:px-5
              flex items-center justify-center
              gap-2
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
                Posting...
              </>
            ) : (
              <>
                <Send size={17} />
                Post Status
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStatusModal;