import { useEffect, useRef, useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";

import Avatar from "../common/Avatar";

const StatusItem = ({
  user,
  statusCount = 0,
  viewed = false,
  isMine = false,
  onClick,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  // ========================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // ========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [showMenu]);

  // ========================================
  // DELETE
  // ========================================

  const handleDelete = (event) => {
    event.stopPropagation();

    setShowMenu(false);

    if (typeof onDelete === "function") {
      onDelete();
    }
  };

  // ========================================
  // MENU
  // ========================================

  const handleMenuClick = (event) => {
    event.stopPropagation();

    setShowMenu((previous) => !previous);
  };

  // ========================================
  // STATUS LABEL
  // ========================================

  const statusLabel = isMine
    ? statusCount > 0
      ? `${statusCount} status${
          statusCount > 1 ? "es" : ""
        }`
      : "No status"
    : viewed
    ? "Viewed"
    : "New status";

  return (
    <div
      className="
        relative
        w-full
        flex items-center
        gap-3
        px-3 sm:px-4
        py-2.5 sm:py-3
        transition-colors
        hover:bg-[#202c33]
      "
    >
      {/* ========================================
          MAIN STATUS BUTTON
      ======================================== */}

      <button
        type="button"
        onClick={onClick}
        className="
          flex
          items-center
          gap-3
          flex-1
          min-w-0
          text-left
          outline-none
        "
      >
        {/* ======================================
            AVATAR
        ======================================= */}

        <div
          className={`
            shrink-0
            rounded-full
            p-[2px]
            transition
            ${
              viewed
                ? "bg-[#667781]"
                : "bg-green-500"
            }
          `}
        >
          <div
            className="
              rounded-full
              bg-[#111b21]
              p-[2px]
            "
          >
            <Avatar
              src={user?.profilePicture}
              name={user?.name}
              size="lg"
            />
          </div>
        </div>

        {/* ======================================
            USER INFORMATION
        ======================================= */}

        <div
          className="
            flex-1
            min-w-0
            py-1
            border-b
            border-[#2a3942]
          "
        >
          <div className="flex items-center min-w-0">
            <h3
              className="
                min-w-0
                flex-1
                text-[14px] sm:text-[15px]
                font-medium
                text-white
                truncate
              "
            >
              {isMine
                ? "My Status"
                : user?.name || "Unknown User"}
            </h3>
          </div>

          <p
            className={`
              mt-1
              text-[11px] sm:text-xs
              truncate
              ${
                !isMine && !viewed
                  ? "text-green-400"
                  : "text-[#8696a0]"
              }
            `}
          >
            {statusLabel}
          </p>
        </div>
      </button>

      {/* ========================================
          THREE DOT MENU
          ONLY FOR MY STATUS
      ======================================== */}

      {isMine && statusCount > 0 && (
        <div
          ref={menuRef}
          className="relative shrink-0"
        >
          <button
            type="button"
            onClick={handleMenuClick}
            aria-label="Status options"
            aria-expanded={showMenu}
            title="Status options"
            className="
              w-9 h-9
              flex items-center justify-center
              rounded-full
              text-[#8696a0]
              hover:text-white
              hover:bg-[#2a3942]
              active:bg-[#374045]
              transition
            "
          >
            <MoreVertical size={19} />
          </button>

          {/* ====================================
              DELETE MENU
          ===================================== */}

          {showMenu && (
            <div
              className="
                absolute
                right-0
                top-10
                z-50
                w-48
                overflow-hidden
                rounded-xl
                bg-[#233138]
                border
                border-[#374045]
                shadow-2xl
                animate-in
                fade-in
                zoom-in-95
                duration-100
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                onClick={handleDelete}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-left
                  text-sm
                  text-red-400
                  hover:bg-[#2a3942]
                  hover:text-red-300
                  transition
                "
              >
                <Trash2
                  size={17}
                  className="shrink-0"
                />

                <span>Delete status</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusItem;