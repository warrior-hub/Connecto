import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Paperclip,
  Send,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import { sendMessage } from "../../services/messageService";

const MessageInput = ({
  selectedChat,
  onMessageSent,
}) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] =
    useState(null);
  const [imagePreview, setImagePreview] =
    useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // ==========================================
  // AUTH
  // ==========================================

  const token = useSelector(
    (state) => state.auth.token
  );

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const currentUserId =
    currentUser?._id?.toString() ||
    currentUser?.id?.toString();

  // ==========================================
  // CLEANUP PREVIEW URL
  // ==========================================

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ==========================================
  // SELECT IMAGE
  // ==========================================

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Only images
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      e.target.value = "";
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB.");
      e.target.value = "";
      return;
    }

    // Remove old preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);

    // Allow same image to be selected again
    e.target.value = "";
  };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSend = async (e) => {
    e?.preventDefault();

    const trimmedMessage =
      message.trim();

    // Need text OR image
    if (
      !trimmedMessage &&
      !selectedImage
    ) {
      return;
    }

    // Receiver required
    if (!selectedChat?.userId) {
      return;
    }

    // Token required
    if (!token) {
      alert(
        "Your session has expired. Please login again."
      );
      return;
    }

    const receiverId =
      selectedChat.userId.toString();

    // ========================================
    // SELF MESSAGE PROTECTION
    // ========================================

    if (
      currentUserId &&
      receiverId === currentUserId
    ) {
      return;
    }

    try {
      setLoading(true);

      const data = await sendMessage(
        receiverId,
        trimmedMessage,
        token,
        selectedImage
      );

      if (data?.success) {
        onMessageSent?.(data.message);

        setMessage("");
        removeImage();

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height =
            "auto";
        }
      } else {
        alert(
          data?.message ||
            "Message could not be sent."
        );
      }
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ENTER TO SEND
  // SHIFT + ENTER = NEW LINE
  // ==========================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      handleSend(e);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <form
      onSubmit={handleSend}
      className="
        relative
        w-full
        flex
        items-end
        gap-2
        px-2.5
        sm:px-3
        py-2.5
        sm:py-3
        bg-[#202c33]
      "
    >
      {/* ====================================== */}
      {/* IMAGE PREVIEW */}
      {/* ====================================== */}

      {imagePreview && (
        <div
          className="
            absolute
            bottom-full
            left-2.5
            sm:left-3
            mb-2
            p-2
            bg-[#233138]
            border
            border-[#374045]
            rounded-xl
            shadow-2xl
            z-40
          "
        >
          <div className="relative">
            <img
              src={imagePreview}
              alt="Selected preview"
              className="
                w-28
                h-28
                sm:w-36
                sm:h-36
                object-cover
                rounded-lg
              "
            />

            {/* REMOVE IMAGE */}

            <button
              type="button"
              onClick={removeImage}
              disabled={loading}
              aria-label="Remove selected image"
              title="Remove image"
              className="
                absolute
                -top-2
                -right-2
                w-7
                h-7
                flex
                items-center
                justify-center
                rounded-full
                bg-[#111b21]
                border
                border-[#374045]
                text-white
                hover:bg-red-500
                transition
                disabled:opacity-50
              "
            >
              <X size={15} />
            </button>

            {/* IMAGE LABEL */}

            <div
              className="
                absolute
                bottom-1.5
                left-1.5
                flex
                items-center
                gap-1
                px-1.5
                py-1
                rounded-md
                bg-black/60
                text-white
                text-[10px]
              "
            >
              <ImageIcon size={11} />
              Image
            </div>
          </div>
        </div>
      )}

      {/* ====================================== */}
      {/* ATTACH IMAGE */}
      {/* ====================================== */}

      <button
        type="button"
        onClick={() =>
          fileInputRef.current?.click()
        }
        disabled={loading}
        aria-label="Attach image"
        title="Send image"
        className="
          shrink-0
          w-10
          h-10
          flex
          items-center
          justify-center
          rounded-full
          text-[#8696a0]
          hover:text-white
          hover:bg-[#2a3942]
          active:bg-[#374045]
          disabled:opacity-40
          disabled:cursor-not-allowed
          transition
        "
      >
        <Paperclip size={21} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* ====================================== */}
      {/* MESSAGE INPUT */}
      {/* ====================================== */}

      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);

          // Auto-grow textarea
          e.target.style.height = "auto";
          e.target.style.height = `${Math.min(
            e.target.scrollHeight,
            120
          )}px`;
        }}
        onKeyDown={handleKeyDown}
        placeholder={
          selectedImage
            ? "Add a caption..."
            : "Type a message"
        }
        disabled={loading}
        maxLength={5000}
        rows={1}
        className="
          flex-1
          min-w-0
          max-h-[120px]
          resize-none
          overflow-y-auto
          bg-[#2a3942]
          text-white
          text-sm
          leading-5
          rounded-xl
          px-4
          py-2.5
          outline-none
          border
          border-transparent
          focus:border-[#3b4a50]
          placeholder:text-[#8696a0]
          disabled:opacity-60
          scrollbar-thin
          scrollbar-thumb-[#4a555c]
        "
      />

      {/* ====================================== */}
      {/* SEND BUTTON */}
      {/* ====================================== */}

      <button
        type="submit"
        disabled={
          loading ||
          !token ||
          !selectedChat?.userId ||
          (!message.trim() && !selectedImage)
        }
        aria-label="Send message"
        title="Send"
        className="
          shrink-0
          w-10
          h-10
          flex
          items-center
          justify-center
          rounded-full
          bg-[#00a884]
          text-white
          hover:bg-[#06cf9c]
          active:bg-[#009879]
          disabled:bg-[#2a3942]
          disabled:text-[#667781]
          disabled:cursor-not-allowed
          transition
        "
      >
        {loading ? (
          <Loader2
            size={19}
            className="animate-spin"
          />
        ) : (
          <Send size={19} />
        )}
      </button>
    </form>
  );
};

export default MessageInput;