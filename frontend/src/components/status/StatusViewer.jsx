import {
  useEffect,
  useState,
} from "react";

import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

import { useSelector } from "react-redux";

import Avatar from "../common/Avatar";

import {
  markStatusViewed,
} from "../../services/statusService";

const StatusViewer = ({
  statusGroup,
  onClose,
  onStatusViewed,
  onViewersClick,
}) => {
  // =========================================
  // AUTH
  // =========================================

  const token = useSelector(
    (state) => state.auth.token
  );

  // =========================================
  // STATUS DATA
  // =========================================

  const statuses =
    statusGroup?.statuses || [];

  const user =
    statusGroup?.user;

  const isMine =
    statusGroup?.isMine === true;

  // =========================================
  // STATE
  // =========================================

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    progress,
    setProgress,
  ] = useState(0);

  // =========================================
  // CURRENT STATUS
  // =========================================

  const currentStatus =
    statuses[currentIndex];

  // =========================================
  // RESET WHEN STATUS GROUP CHANGES
  // =========================================

  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
  }, [statusGroup]);

  // =========================================
  // MARK STATUS AS VIEWED
  // =========================================

  useEffect(() => {
    const markViewed = async () => {
      // Own status ko viewed mark nahi karna
      if (
        !currentStatus?._id ||
        !token ||
        isMine
      ) {
        return;
      }

      try {
        const data =
          await markStatusViewed(
            currentStatus._id,
            token
          );

        if (data.success) {
          onStatusViewed?.(
            currentStatus._id
          );
        }
      } catch (error) {
        console.error(
          "Mark status viewed error:",
          error.response?.data?.message ||
            error.message
        );
      }
    };

    markViewed();
  }, [
    currentStatus?._id,
    token,
    isMine,
    onStatusViewed,
  ]);

  // =========================================
  // AUTO PROGRESS
  // =========================================

  useEffect(() => {
    if (!currentStatus) {
      return;
    }

    setProgress(0);

    const duration = 5000;
    const intervalTime = 50;

    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalTime;

      const percentage =
        (elapsed / duration) * 100;

      setProgress(
        Math.min(
          percentage,
          100
        )
      );

      if (elapsed >= duration) {
        clearInterval(interval);

        if (
          currentIndex <
          statuses.length - 1
        ) {
          setCurrentIndex(
            (prev) => prev + 1
          );
        } else {
          onClose?.();
        }
      }
    }, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, [
    currentIndex,
    currentStatus?._id,
    statuses.length,
    onClose,
  ]);

  // =========================================
  // PREVIOUS
  // =========================================

  const handlePrevious = () => {
    if (currentIndex <= 0) {
      return;
    }

    setCurrentIndex(
      (prev) => prev - 1
    );
  };

  // =========================================
  // NEXT
  // =========================================

  const handleNext = () => {
    if (
      currentIndex <
      statuses.length - 1
    ) {
      setCurrentIndex(
        (prev) => prev + 1
      );

      return;
    }

    onClose?.();
  };

  // =========================================
  // VIEW COUNT
  // =========================================

  const viewCount =
    currentStatus?.viewers?.length || 0;

  // =========================================
  // EMPTY CHECK
  // =========================================

  if (!currentStatus) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        bg-black
        flex
        items-center
        justify-center
      "
    >

      {/* =====================================
          STATUS CONTAINER
      ====================================== */}

      <div
        className="
          relative
          w-full
          h-full
          max-w-[500px]
          bg-[#111b21]
          overflow-hidden
        "
      >

        {/* ===================================
            PROGRESS BARS
        ==================================== */}

        <div
          className="
            absolute
            top-3
            left-3
            right-3
            z-40
            flex
            gap-1
          "
        >
          {statuses.map(
            (status, index) => {
              const isCompleted =
                index < currentIndex;

              const isCurrent =
                index === currentIndex;

              return (
                <div
                  key={status._id}
                  className="
                    h-1
                    flex-1
                    bg-white/30
                    rounded-full
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      h-full
                      bg-white
                      rounded-full
                    "
                    style={{
                      width:
                        isCompleted
                          ? "100%"
                          : isCurrent
                          ? `${progress}%`
                          : "0%",
                    }}
                  />
                </div>
              );
            }
          )}
        </div>

        {/* ===================================
            HEADER
        ==================================== */}

        <div
          className="
            absolute
            top-0
            left-0
            right-0
            z-30
            pt-7
            px-4
            pb-5
            bg-gradient-to-b
            from-black/80
            to-transparent
          "
        >

          <div className="flex items-center gap-3">

            {/* Avatar */}

            <Avatar
              src={
                user?.profilePicture
              }
              name={
                user?.name
              }
              size="md"
            />

            {/* User info */}

            <div
              className="
                flex-1
                min-w-0
              "
            >

              <h3
                className="
                  text-white
                  font-medium
                  truncate
                "
              >
                {user?.name || "User"}
              </h3>

              <p
                className="
                  text-xs
                  text-white/70
                "
              >
                {currentStatus.createdAt
                  ? new Date(
                      currentStatus.createdAt
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : ""}
              </p>

              {/* =================================
                  OWN STATUS VIEW COUNT
              ================================== */}

            

            </div>

            {/* Close */}

            <button
              type="button"
              onClick={onClose}
              className="
                p-2
                rounded-full
                text-white
                hover:bg-white/10
                transition
              "
              aria-label="Close status"
            >
              <X size={24} />
            </button>

          </div>

        </div>

        {/* ===================================
            STATUS CONTENT
        ==================================== */}

        <div
          className="
            w-full
            h-full
            flex
            items-center
            justify-center
          "
          style={{
            backgroundColor:
              currentStatus.type === "text"
                ? currentStatus.backgroundColor ||
                  "#005c4b"
                : "#000",
          }}
        >

          {/* =================================
              TEXT STATUS
          ================================== */}

          {currentStatus.type ===
            "text" && (
            <p
              className="
                px-8
                text-white
                text-2xl
                sm:text-3xl
                font-medium
                text-center
                whitespace-pre-wrap
                break-words
              "
            >
              {currentStatus.text}
            </p>
          )}

          {/* =================================
              IMAGE STATUS
          ================================== */}

          {currentStatus.type ===
            "image" && (
            <img
              src={
                currentStatus.mediaUrl
              }
              alt="Status"
              className="
                max-w-full
                max-h-full
                object-contain
              "
            />
          )}

          {/* =================================
              VIDEO STATUS
          ================================== */}

          {currentStatus.type ===
            "video" && (
            <video
              src={
                currentStatus.mediaUrl
              }
              autoPlay
              muted
              playsInline
              className="
                max-w-full
                max-h-full
                object-contain
              "
            />
          )}

        </div>

     {/* ===================================
    VIEW COUNT — BOTTOM
==================================== */}

{isMine && (
  <div
    className="
      absolute
      bottom-0
      left-0
      right-0
      z-30
      pb-6
      pt-16
      px-4
      bg-gradient-to-t
      from-black/80
      via-black/30
      to-transparent
      flex
      justify-center
    "
  >
    <button
      type="button"
      onClick={() =>
        onViewersClick?.(
          currentStatus
        )
      }
      className="
        flex
        items-center
        gap-2
        px-4
        py-2
        rounded-full
        bg-black/40
        backdrop-blur-md
        text-white
        hover:bg-black/60
        transition
      "
    >
      <Eye size={17} />

      <span className="text-sm font-medium">
        {viewCount}{" "}
        {viewCount === 1
          ? "view"
          : "views"}
      </span>
    </button>
  </div>
)}
      </div>
    </div>
  );
};

export default StatusViewer;