import { useState } from "react";
import { useSelector } from "react-redux";
import {
  X,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";

import {
  editMessage,
  deleteMessage,
} from "../../services/messageService";

const MessageBubble = ({ message }) => {
  const [showImage, setShowImage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(
    message?.text || ""
  );

  const [loading, setLoading] = useState(false);

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const token = useSelector(
    (state) => state.auth.token
  );

  const currentUserId =
    currentUser?._id?.toString() ||
    currentUser?.id?.toString();

  // ==========================================
  // GET SENDER ID
  // ==========================================

  const senderId =
    typeof message?.sender === "object"
      ? message?.sender?._id?.toString()
      : message?.sender?.toString();

  // ==========================================
  // CHECK MY MESSAGE
  // ==========================================

  const isMine = Boolean(
    currentUserId &&
      senderId &&
      currentUserId === senderId
  );

  // ==========================================
  // TIME
  // ==========================================

  const messageTime = message?.createdAt
    ? new Date(
        message.createdAt
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // ==========================================
  // STATUS
  // ==========================================

  const getStatusIcon = () => {
    if (!isMine) {
      return null;
    }

    if (message?.status === "read") {
      return (
        <span
          className="
            text-blue-400
            font-semibold
            tracking-[-2px]
          "
        >
          ✓✓
        </span>
      );
    }

    if (message?.status === "delivered") {
      return (
        <span
          className="
            text-[#8696a0]
            tracking-[-2px]
          "
        >
          ✓✓
        </span>
      );
    }

    return (
      <span className="text-[#8696a0]">
        ✓
      </span>
    );
  };

  // ==========================================
  // IS IMAGE MESSAGE
  // ==========================================

  const isImage =
    message?.messageType === "image" &&
    Boolean(message?.mediaUrl);

  // ==========================================
  // OPEN EDIT
  // ==========================================

  const handleEdit = () => {
    setShowMenu(false);
    setEditText(message?.text || "");
    setIsEditing(true);
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditText(message?.text || "");
    setIsEditing(false);
  };

  // ==========================================
  // SAVE EDIT
  // ==========================================

  const handleSaveEdit = async () => {
    const trimmedText = editText.trim();

    if (!trimmedText) {
      return;
    }

    if (trimmedText === message?.text) {
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);

      await editMessage(
        message._id,
        trimmedText,
        token
      );

      setIsEditing(false);
    } catch (error) {
      console.error(
        "Edit message error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to edit message"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE MESSAGE
  // ==========================================

  const handleDelete = async () => {
    setShowMenu(false);

    const confirmed = window.confirm(
      "Delete this message for everyone?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      await deleteMessage(
        message._id,
        token
      );
    } catch (error) {
      console.error(
        "Delete message error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to delete message"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETED MESSAGE
  // ==========================================

  if (message?.isDeleted) {
    return (
      <div
        className={`
          w-full
          flex
          mb-2
          ${
            isMine
              ? "justify-end"
              : "justify-start"
          }
        `}
      >
        <div
          className={`
            max-w-[85%]
            sm:max-w-[70%]
            px-3
            py-2
            rounded-lg
            shadow-sm
            border
            ${
              isMine
                ? `
                  bg-[#005c4b]
                  border-[#087e6b]
                  text-[#b7d8d0]
                  rounded-br-none
                `
                : `
                  bg-[#202c33]
                  border-[#2a3942]
                  text-[#8696a0]
                  rounded-bl-none
                `
            }
          `}
        >
          <div className="flex items-center gap-2">
            <Trash2
              size={14}
              className="shrink-0 opacity-70"
            />

            <span className="text-sm italic">
              This message was deleted
            </span>
          </div>

          <div className="flex justify-end mt-1">
            <span className="text-[10px] opacity-70">
              {messageTime}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <div
        className={`
          w-full
          flex
          mb-1.5
          sm:mb-2
          ${
            isMine
              ? "justify-end"
              : "justify-start"
          }
        `}
      >
        {/* ================================== */}
        {/* MESSAGE BUBBLE */}
        {/* ================================== */}

        <div
          className={`
            relative
            max-w-[88%]
            sm:max-w-[70%]
            md:max-w-[65%]
            rounded-lg
            shadow-sm
            overflow-visible
            ${
              isMine
                ? `
                  bg-[#005c4b]
                  text-white
                  rounded-br-none
                `
                : `
                  bg-[#202c33]
                  text-white
                  rounded-bl-none
                `
            }
          `}
        >
          {/* ================================== */}
          {/* THREE DOT MENU */}
          {/* ================================== */}

          {isMine && (
            <div
              className="
                absolute
                top-1
                right-1
                z-30
              "
            >
              <button
                type="button"
                onClick={() =>
                  setShowMenu(
                    (prev) => !prev
                  )
                }
                disabled={loading}
                aria-label="Message options"
                title="Message options"
                className="
                  w-7
                  h-7
                  flex
                  items-center
                  justify-center
                  rounded-full
                  text-white/60
                  hover:text-white
                  hover:bg-black/20
                  active:bg-black/30
                  transition
                  disabled:opacity-40
                "
              >
                <MoreVertical size={16} />
              </button>

              {/* ================================== */}
              {/* MENU */}
              {/* ================================== */}

              {showMenu && (
                <div
                  className="
                    absolute
                    right-0
                    top-8
                    w-36
                    bg-[#233138]
                    rounded-lg
                    shadow-2xl
                    border
                    border-[#374045]
                    overflow-hidden
                    z-50
                  "
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  {/* EDIT */}

                  {message?.messageType ===
                    "text" && (
                    <button
                      type="button"
                      onClick={handleEdit}
                      disabled={loading}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        text-sm
                        text-white
                        hover:bg-[#2a3b43]
                        transition
                        disabled:opacity-50
                      "
                    >
                      <Pencil size={15} />

                      <span>
                        Edit
                      </span>
                    </button>
                  )}

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-3
                      py-2.5
                      text-sm
                      text-red-400
                      hover:bg-[#2a3b43]
                      transition
                      disabled:opacity-50
                    "
                  >
                    <Trash2 size={15} />

                    <span>
                      Delete
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================== */}
          {/* IMAGE */}
          {/* ================================== */}

          {isImage && (
            <button
              type="button"
              onClick={() =>
                setShowImage(true)
              }
              className="
                block
                w-full
                overflow-hidden
                rounded-lg
                cursor-pointer
                focus:outline-none
              "
              aria-label="Open image"
            >
              <img
                src={message.mediaUrl}
                alt="Sent image"
                loading="lazy"
                className="
                  block
                  w-full
                  max-w-[320px]
                  max-h-[400px]
                  object-cover
                  rounded-lg
                  hover:opacity-90
                  transition
                "
              />
            </button>
          )}

          {/* ================================== */}
          {/* EDIT MODE */}
          {/* ================================== */}

          {isEditing ? (
            <div className="p-2 min-w-[230px] sm:min-w-[280px]">
              <textarea
                value={editText}
                onChange={(e) =>
                  setEditText(e.target.value)
                }
                autoFocus
                rows={3}
                maxLength={5000}
                disabled={loading}
                className="
                  w-full
                  resize-none
                  bg-[#0b141a]
                  text-white
                  text-sm
                  rounded-lg
                  border
                  border-[#3b4a50]
                  outline-none
                  px-3
                  py-2
                  leading-5
                  focus:border-[#00a884]
                  disabled:opacity-60
                "
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    handleSaveEdit();
                  }

                  if (
                    e.key === "Escape"
                  ) {
                    handleCancelEdit();
                  }
                }}
              />

              <div
                className="
                  flex
                  items-center
                  justify-end
                  gap-2
                  mt-2
                "
              >
                {/* CANCEL */}

                <button
                  type="button"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={loading}
                  className="
                    px-2.5
                    py-1.5
                    rounded-md
                    text-xs
                    text-[#8696a0]
                    hover:text-white
                    hover:bg-white/5
                    transition
                    disabled:opacity-40
                  "
                >
                  Cancel
                </button>

                {/* SAVE */}

                <button
                  type="button"
                  onClick={
                    handleSaveEdit
                  }
                  disabled={
                    loading ||
                    !editText.trim()
                  }
                  className="
                    min-w-[62px]
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    px-2.5
                    py-1.5
                    rounded-md
                    bg-[#00a884]
                    hover:bg-[#06cf9c]
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    text-white
                    text-xs
                    font-medium
                    transition
                  "
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={13}
                        className="animate-spin"
                      />

                      Saving
                    </>
                  ) : (
                    <>
                      <Check size={13} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ================================== */}
              {/* TEXT / CAPTION */}
              {/* ================================== */}

              {message?.text && (
                <p
                  className={`
                    text-[13px]
                    sm:text-sm
                    leading-[1.45]
                    whitespace-pre-wrap
                    break-words
                    px-2.5
                    pt-2
                    ${
                      isImage
                        ? "pb-0"
                        : "pb-1"
                    }
                    ${
                      isMine
                        ? "pr-8"
                        : "pr-2.5"
                    }
                  `}
                >
                  {message.text}
                </p>
              )}
            </>
          )}

          {/* ================================== */}
          {/* TIME + STATUS */}
          {/* ================================== */}

          {!isEditing && (
            <div
              className={`
                flex
                items-center
                justify-end
                gap-1
                px-2.5
                pb-1.5
                pt-0.5
                ${
                  isMine
                    ? "text-[#b7d8d0]"
                    : "text-[#8696a0]"
                }
              `}
            >
              {message?.edited && (
                <span className="text-[9px] italic">
                  edited
                </span>
              )}

              <span className="text-[10px] leading-none">
                {messageTime}
              </span>

              {isMine && (
                <span className="text-[11px] leading-none">
                  {getStatusIcon()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ====================================== */}
      {/* FULL SCREEN IMAGE VIEWER */}
      {/* ====================================== */}

      {showImage && isImage && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            bg-black/90
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-3
            sm:p-6
          "
          onClick={() =>
            setShowImage(false)
          }
        >
          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={() =>
              setShowImage(false)
            }
            aria-label="Close image"
            title="Close"
            className="
              absolute
              top-3
              right-3
              sm:top-5
              sm:right-5
              w-10
              h-10
              flex
              items-center
              justify-center
              rounded-full
              text-white
              bg-black/50
              hover:bg-black/70
              transition
              z-10
            "
          >
            <X size={24} />
          </button>

          {/* IMAGE */}

          <img
            src={message.mediaUrl}
            alt="Full size"
            className="
              max-w-full
              max-h-[92vh]
              object-contain
              rounded-lg
              select-none
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          />
        </div>
      )}
    </>
  );
};

export default MessageBubble;