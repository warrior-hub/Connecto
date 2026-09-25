
import {
  X,
  Eye,
  Clock,
  ChevronDown,
} from "lucide-react";

import Avatar from "../common/Avatar";

const StatusViewersModal = ({
  status,
  onClose,
}) => {
  // =========================================
  // SAFETY CHECK
  // =========================================

  if (!status) {
    return null;
  }

  // =========================================
  // VIEWERS
  // =========================================

  const viewers = status.viewers || [];

  // =========================================
  // FORMAT VIEW TIME
  // =========================================

  const formatViewedAt = (viewedAt) => {
    if (!viewedAt) {
      return "Unknown time";
    }

    const date = new Date(viewedAt);

    if (Number.isNaN(date.getTime())) {
      return "Unknown time";
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================
  // SORT VIEWERS
  // =========================================

  const sortedViewers = [...viewers].sort(
    (a, b) => {
      const first = new Date(
        b.viewedAt || 0
      ).getTime();

      const second = new Date(
        a.viewedAt || 0
      ).getTime();

      return first - second;
    }
  );

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        bg-black/50
        flex
        items-end
        justify-center
      "
      onClick={onClose}
    >
      {/* =====================================
          BOTTOM SHEET
      ====================================== */}

      <div
        className="
          w-full
          max-w-[650px]
          max-h-[78vh]
          bg-[#202c33]
          rounded-t-3xl
          shadow-2xl
          overflow-hidden
          flex
          flex-col
          animate-[slideUp_0.25s_ease-out]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* ===================================
            DRAG HANDLE
        ==================================== */}

        <div
          className="
            shrink-0
            flex
            justify-center
            pt-3
            pb-2
          "
        >
          <div
            className="
              w-10
              h-1
              rounded-full
              bg-[#8696a0]
            "
          />
        </div>

        {/* ===================================
            HEADER
        ==================================== */}

        <div
          className="
            shrink-0
            flex
            items-center
            gap-3
            px-5
            pt-2
            pb-4
            border-b
            border-[#2a3942]
          "
        >
          {/* Eye */}

          <div
            className="
              w-10
              h-10
              rounded-full
              bg-[#005c4b]
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <Eye
              size={20}
              className="text-white"
            />
          </div>

          {/* Title */}

          <div className="flex-1 min-w-0">
            <h2
              className="
                text-white
                font-semibold
                text-base
              "
            >
              Viewed by
            </h2>

            <p
              className="
                text-xs
                text-[#8696a0]
                mt-0.5
              "
            >
              {viewers.length}{" "}
              {viewers.length === 1
                ? "person"
                : "people"}
            </p>
          </div>

          {/* Close */}

          <button
            type="button"
            onClick={onClose}
            className="
              w-9
              h-9
              rounded-full
              flex
              items-center
              justify-center
              text-[#aebac1]
              hover:text-white
              hover:bg-[#2a3942]
              transition
            "
            aria-label="Close viewers"
          >
            <X size={20} />
          </button>
        </div>

        {/* ===================================
            VIEWERS LIST
        ==================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
            overscroll-contain
          "
        >
          {sortedViewers.length === 0 ? (
            /* =================================
                NO VIEWERS
            ================================== */

            <div
              className="
                py-14
                px-6
                text-center
              "
            >
              <div
                className="
                  w-16
                  h-16
                  mx-auto
                  rounded-full
                  bg-[#111b21]
                  flex
                  items-center
                  justify-center
                "
              >
                <Eye
                  size={28}
                  className="text-[#8696a0]"
                />
              </div>

              <h3
                className="
                  text-white
                  font-medium
                  mt-4
                "
              >
                No views yet
              </h3>

              <p
                className="
                  text-sm
                  text-[#8696a0]
                  mt-1
                  max-w-xs
                  mx-auto
                "
              >
                When someone views your
                status, they will appear
                here.
              </p>
            </div>
          ) : (
            /* =================================
                VIEWERS
            ================================== */

            <div className="py-1">
              {sortedViewers.map(
                (viewer, index) => {
                  const viewerUser =
                    viewer.user;

                  if (!viewerUser) {
                    return null;
                  }

                  return (
                    <div
                      key={
                        viewerUser._id ||
                        `${viewerUser.username}-${index}`
                      }
                      className="
                        flex
                        items-center
                        gap-3
                        px-5
                        py-3.5
                        hover:bg-[#2a3942]
                        transition
                      "
                    >
                      {/* AVATAR */}

                      <Avatar
                        src={
                          viewerUser.profilePicture
                        }
                        name={
                          viewerUser.name
                        }
                        size="md"
                      />

                      {/* USER */}

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
                          {viewerUser.name ||
                            "Unknown User"}
                        </h3>

                        
                      </div>

                      {/* TIME */}

                      <div
                        className="
                          shrink-0
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          text-[#8696a0]
                        "
                      >
                        <Clock size={13} />

                        <span>
                          {formatViewedAt(
                            viewer.viewedAt
                          )}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* ===================================
            FOOTER
        ==================================== */}

       
      </div>
    </div>
  );
};

export default StatusViewersModal;

