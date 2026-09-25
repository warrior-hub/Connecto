import { Plus, Loader2, CircleDashed } from "lucide-react";

import Avatar from "../common/Avatar";
import StatusItem from "./StatusItem";

const StatusSidebar = ({
  currentUser,
  myStatuses = [],
  otherStatuses = [],
  onCreateStatus,
  onOpenStatus,
  onDeleteStatus,
  deletingStatus = false,
}) => {
  // =========================================
  // OPEN MY STATUS
  // =========================================

  const handleMyStatusClick = () => {
    if (myStatuses.length > 0) {
      onOpenStatus?.({
        user: currentUser,
        statuses: myStatuses,
        isMine: true,
      });

      return;
    }

    onCreateStatus?.();
  };

  // =========================================
  // DELETE MY STATUS
  // =========================================

  const handleDeleteStatus = () => {
    if (deletingStatus) return;

    onDeleteStatus?.();
  };

  return (
    <aside
      className="
        h-full
        w-full
        flex
        flex-col
        overflow-hidden
        bg-[#111b21]
      "
    >
      {/* =====================================
          HEADER
      ====================================== */}

      <header
        className="
          h-[64px] sm:h-[70px]
          shrink-0
          flex
          items-center
          gap-3
          px-3 sm:px-4
          bg-[#202c33]
          border-b
          border-[#2a3942]
        "
      >
        <div className="shrink-0">
          <Avatar
            src={currentUser?.profilePicture}
            name={currentUser?.name}
            size="md"
          />
        </div>

        <div className="min-w-0">
          <h1
            className="
              text-[16px] sm:text-lg
              font-semibold
              text-white
              truncate
            "
          >
            Status
          </h1>

          <p
            className="
              text-[10px] sm:text-[11px]
              text-[#8696a0]
              mt-0.5
              truncate
            "
          >
            Share updates with your contacts
          </p>
        </div>
      </header>

      {/* =====================================
          CONTENT
      ====================================== */}

      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          scrollbar-thin
          scrollbar-thumb-[#374045]
          scrollbar-track-transparent
        "
      >
        {/* ===================================
            MY STATUS SECTION
        ==================================== */}

        <section className="px-2 sm:px-3 pt-3 pb-2">
          <div
            className="
              px-2
              mb-2
              text-[10px] sm:text-[11px]
              uppercase
              tracking-wider
              font-medium
              text-[#8696a0]
            "
          >
            My Status
          </div>

          {myStatuses.length > 0 ? (
            <StatusItem
              user={currentUser}
              statusCount={myStatuses.length}
              viewed={false}
              isMine={true}
              onClick={handleMyStatusClick}
              onDelete={handleDeleteStatus}
            />
          ) : (
            <div
              className="
                flex
                items-center
                gap-3
                px-2
                py-2
                rounded-xl
                hover:bg-[#202c33]
                transition
              "
            >
              {/* ===============================
                  ADD STATUS AVATAR
              ================================ */}

              <button
                type="button"
                onClick={handleMyStatusClick}
                disabled={deletingStatus}
                title="Add status"
                aria-label="Add status"
                className="
                  relative
                  shrink-0
                  outline-none
                "
              >
                <div
                  className="
                    rounded-full
                    p-[2px]
                    bg-[#667781]
                  "
                >
                  <div
                    className="
                      rounded-full
                      bg-[#111b21]
                      p-[2px]
                    "
                  >
                    <Avatar
                      src={currentUser?.profilePicture}
                      name={currentUser?.name}
                      size="lg"
                    />
                  </div>
                </div>

                {/* PLUS */}

                <span
                  className="
                    absolute
                    right-0
                    bottom-0
                    w-6
                    h-6
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-green-500
                    border-[2px]
                    border-[#111b21]
                    shadow-lg
                  "
                >
                  <Plus
                    size={15}
                    strokeWidth={2.5}
                    className="text-black"
                  />
                </span>
              </button>

              {/* ===============================
                  ADD STATUS TEXT
              ================================ */}

              <button
                type="button"
                onClick={handleMyStatusClick}
                disabled={deletingStatus}
                className="
                  flex-1
                  min-w-0
                  text-left
                  py-1
                  outline-none
                "
              >
                <h3
                  className="
                    text-[14px] sm:text-[15px]
                    font-medium
                    text-white
                    truncate
                  "
                >
                  My Status
                </h3>

                <p
                  className="
                    text-[11px] sm:text-xs
                    text-[#8696a0]
                    mt-1
                    truncate
                  "
                >
                  Tap to add status update
                </p>
              </button>
            </div>
          )}
        </section>

        {/* ===================================
            DELETE LOADING
        ==================================== */}

        {deletingStatus && (
          <div
            className="
              mx-4
              mb-2
              flex
              items-center
              gap-2
              px-3
              py-2
              rounded-lg
              bg-red-500/10
              border
              border-red-500/10
              text-red-400
              text-[11px]
            "
          >
            <Loader2
              size={14}
              className="animate-spin shrink-0"
            />

            <span>Deleting your status...</span>
          </div>
        )}

        {/* ===================================
            RECENT UPDATES HEADER
        ==================================== */}

        <div
          className="
            flex
            items-center
            gap-2
            px-4
            pt-3
            pb-2
          "
        >
          <CircleDashed
            size={14}
            className="text-[#8696a0]"
          />

          <span
            className="
              text-[10px] sm:text-[11px]
              uppercase
              tracking-wider
              font-medium
              text-[#8696a0]
            "
          >
            Recent updates
          </span>
        </div>

        {/* ===================================
            OTHER USERS STATUSES
        ==================================== */}

        <section className="pb-3">
          {otherStatuses.length === 0 ? (
            <div
              className="
                mx-4
                mt-2
                px-4
                py-8
                text-center
                rounded-xl
                border
                border-[#2a3942]
                bg-[#172126]
              "
            >
              <div
                className="
                  w-12
                  h-12
                  mx-auto
                  mb-3
                  rounded-full
                  bg-[#202c33]
                  flex
                  items-center
                  justify-center
                "
              >
                <CircleDashed
                  size={23}
                  className="text-[#667781]"
                />
              </div>

              <p
                className="
                  text-sm
                  font-medium
                  text-[#d1d7db]
                "
              >
                No recent updates
              </p>

              <p
                className="
                  text-[11px] sm:text-xs
                  leading-5
                  text-[#667781]
                  mt-1.5
                "
              >
                Status updates from your contacts
                will appear here.
              </p>
            </div>
          ) : (
            otherStatuses.map((statusGroup) => {
              const statuses =
                statusGroup?.statuses || [];

              const userId =
                statusGroup?.user?._id ||
                statusGroup?.user?.id;

              const hasUnviewed =
                statuses.some(
                  (status) => !status?.viewed
                );

              return (
                <StatusItem
                  key={userId}
                  user={statusGroup?.user}
                  statusCount={statuses.length}
                  viewed={!hasUnviewed}
                  isMine={false}
                  onClick={() =>
                    onOpenStatus?.(statusGroup)
                  }
                />
              );
            })
          )}
        </section>
      </div>
    </aside>
  );
};

export default StatusSidebar;