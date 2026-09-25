import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useSelector } from "react-redux";

import StatusSidebar from "../components/status/StatusSidebar";
import CreateStatusModal from "../components/status/CreateStatusModal";
import StatusViewer from "../components/status/StatusViewer";
import AppNavigation from "../components/common/AppNavigation";
import StatusViewersModal from "../components/status/StatusViewersModal";

import {
  getMyStatus,
  getOtherStatuses,
  deleteStatus,
} from "../services/statusService";

const Status = () => {
  // =========================================
  // AUTH DATA
  // =========================================

  const token = useSelector(
    (state) => state.auth.token
  );

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  // =========================================
  // STATUS STATE
  // =========================================

  const [myStatuses, setMyStatuses] =
    useState([]);

  const [otherStatuses, setOtherStatuses] =
    useState([]);

  const [selectedStatus, setSelectedStatus] =
    useState(null);

  // =========================================
  // UI STATE
  // =========================================

  const [loading, setLoading] =
    useState(true);

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    deletingStatus,
    setDeletingStatus,
  ] = useState(false);

  // =========================================
  // VIEWERS STATE
  // =========================================

  const [
    selectedViewersStatus,
    setSelectedViewersStatus,
  ] = useState(null);

  // =========================================
  // LOAD STATUSES
  // =========================================

  const loadStatuses = useCallback(
    async () => {
      if (!token) {
        return;
      }

      try {
        setLoading(true);

        const [
          myData,
          otherData,
        ] = await Promise.all([
          getMyStatus(token),
          getOtherStatuses(token),
        ]);

        // ================================
        // MY STATUS
        // ================================

        if (myData.success) {
          setMyStatuses(
            myData.statuses || []
          );
        }

        // ================================
        // OTHER STATUS
        // ================================

        if (otherData.success) {
          setOtherStatuses(
            otherData.users || []
          );
        }
      } catch (error) {
        console.error(
          "Status loading error:",
          error.response?.data?.message ||
            error.message
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // =========================================
  // LOAD ON PAGE OPEN
  // =========================================

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  // =========================================
  // CREATE STATUS
  // =========================================

  const handleCreateStatus = () => {
    setShowCreateModal(true);
  };

  // =========================================
  // CLOSE CREATE MODAL
  // =========================================

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  // =========================================
  // STATUS CREATED
  // =========================================

  const handleStatusCreated = (
    newStatus
  ) => {
    if (!newStatus) {
      return;
    }

    setMyStatuses((prev) => [
      ...prev,
      newStatus,
    ]);

    setShowCreateModal(false);
  };

  // =========================================
  // DELETE MY STATUS
  // =========================================

  const handleDeleteStatus = async () => {
    if (!token) {
      return;
    }

    if (
      !myStatuses ||
      myStatuses.length === 0
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Delete all ${myStatuses.length} of your active statuses?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingStatus(true);

      // ======================================
      // DELETE EACH STATUS
      // ======================================

      await Promise.all(
        myStatuses.map((status) =>
          deleteStatus(
            status._id,
            token
          )
        )
      );

      // ======================================
      // CLEAR MY STATUSES
      // ======================================

      setMyStatuses([]);

      // ======================================
      // CLOSE VIEWER IF OPEN
      // ======================================

      setSelectedStatus(
        (prev) => {
          if (
            prev?.user?._id?.toString() ===
            currentUser?._id?.toString()
          ) {
            return null;
          }

          return prev;
        }
      );

      setSelectedViewersStatus(
        (prev) => {
          if (
            prev?.user?._id?.toString() ===
            currentUser?._id?.toString()
          ) {
            return null;
          }

          return prev;
        }
      );

      console.log(
        "✅ All my statuses deleted"
      );
    } catch (error) {
      console.error(
        "Delete status error:",
        error.response?.data?.message ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Status delete nahi ho paaya."
      );
    } finally {
      setDeletingStatus(false);
    }
  };

  // =========================================
  // OPEN STATUS VIEWER
  // =========================================

  const handleOpenStatus = (
    statusGroup
  ) => {
    if (
      !statusGroup?.statuses?.length
    ) {
      return;
    }

    setSelectedStatus({
      ...statusGroup,

      statuses:
        statusGroup.statuses.map(
          (status) => ({
            ...status,
          })
        ),
    });
  };

  // =========================================
  // STATUS VIEWED
  // =========================================

  const handleStatusViewed =
    useCallback(
      (statusId) => {
        if (!statusId) {
          return;
        }

        // ==================================
        // UPDATE OTHER STATUS
        // ==================================

        setOtherStatuses(
          (prev) =>
            prev.map((group) => {
              const containsStatus =
                group.statuses?.some(
                  (status) =>
                    status._id?.toString() ===
                    statusId.toString()
                );

              if (!containsStatus) {
                return group;
              }

              return {
                ...group,

                statuses:
                  group.statuses.map(
                    (status) =>
                      status._id?.toString() ===
                      statusId.toString()
                        ? {
                            ...status,
                            viewed: true,
                          }
                        : status
                  ),
              };
            })
        );

        // ==================================
        // UPDATE CURRENT VIEWER
        // ==================================

        setSelectedStatus(
          (prev) => {
            if (!prev) {
              return prev;
            }

            return {
              ...prev,

              statuses:
                prev.statuses?.map(
                  (status) =>
                    status._id?.toString() ===
                    statusId.toString()
                      ? {
                          ...status,
                          viewed: true,
                        }
                      : status
                ),
            };
          }
        );
      },
      []
    );

  // =========================================
  // OPEN VIEWERS
  // =========================================

  const handleViewersClick =
    useCallback(
      (status) => {
        if (!status) {
          return;
        }

        setSelectedViewersStatus(
          status
        );
      },
      []
    );

  // =========================================
  // CLOSE STATUS VIEWER
  // =========================================

  const handleCloseViewer =
    useCallback(() => {
      setSelectedStatus(null);
    }, []);

  // =========================================
  // CLOSE VIEWERS
  // =========================================

  const handleCloseViewers =
    useCallback(() => {
      setSelectedViewersStatus(null);
    }, []);

  // =========================================
  // UI
  // =========================================

  return (
    <div
      className="
        h-screen
        w-full
        bg-[#0b141a]
        text-white
        overflow-hidden
      "
    >
      {/* =========================================
          APP NAVIGATION
      ========================================= */}

      <AppNavigation />

      {/* =========================================
          MAIN STATUS AREA
      ========================================= */}

      <main
        className="
          h-full
          w-full
          overflow-hidden
          pb-14
          md:pb-0
          md:pl-[72px]
        "
      >
        <div
          className="
            flex
            h-full
            w-full
          "
        >
          {/* =====================================
              STATUS SIDEBAR
          ====================================== */}

          <aside
            className="
              w-full
              md:w-[380px]
              lg:w-[400px]
              shrink-0
              border-r
              border-[#2a3942]
              bg-[#111b21]
              overflow-hidden
            "
          >
            {loading ? (
              <div
                className="
                  h-full
                  w-full
                  flex
                  items-center
                  justify-center
                  bg-[#111b21]
                  text-[#8696a0]
                "
              >
                <div className="text-center">
                  <div
                    className="
                      w-8
                      h-8
                      mx-auto
                      border-2
                      border-[#8696a0]
                      border-t-green-400
                      rounded-full
                      animate-spin
                    "
                  />

                  <p className="mt-3 text-sm">
                    Loading statuses...
                  </p>
                </div>
              </div>
            ) : (
              <StatusSidebar
                currentUser={
                  currentUser
                }

                myStatuses={
                  myStatuses
                }

                otherStatuses={
                  otherStatuses
                }

                onCreateStatus={
                  handleCreateStatus
                }

                onOpenStatus={
                  handleOpenStatus
                }

                onDeleteStatus={
                  handleDeleteStatus
                }

                deletingStatus={
                  deletingStatus
                }
              />
            )}
          </aside>

          {/* =====================================
              DESKTOP STATUS PREVIEW AREA
          ====================================== */}

          <section
            className="
              hidden
              md:flex
              flex-1
              min-w-0
              h-full
              items-center
              justify-center
              bg-[#0b141a]
            "
          >
            <div
              className="
                text-center
                text-[#8696a0]
                px-6
              "
            >
              <div
                className="
                  w-20
                  h-20
                  mx-auto
                  mb-5
                  rounded-full
                  bg-[#202c33]
                  flex
                  items-center
                  justify-center
                  text-3xl
                "
              >
                📸
              </div>

              <h2
                className="
                  text-xl
                  text-white
                  font-semibold
                "
              >
                VibeTalk Status
              </h2>

              <p className="text-sm mt-2">
                Select a status to view
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* =========================================
          CREATE STATUS MODAL
      ========================================= */}

      {showCreateModal && (
        <CreateStatusModal
          onClose={
            handleCloseCreateModal
          }
          onCreated={
            handleStatusCreated
          }
        />
      )}

      {/* =========================================
          STATUS VIEWER
      ========================================= */}

      {selectedStatus && (
        <StatusViewer
          statusGroup={
            selectedStatus
          }
          onClose={
            handleCloseViewer
          }
          onStatusViewed={
            handleStatusViewed
          }
          onViewersClick={
            handleViewersClick
          }
        />
      )}

      {/* =========================================
          STATUS VIEWERS MODAL
      ========================================= */}

      {selectedViewersStatus && (
        <StatusViewersModal
          status={
            selectedViewersStatus
          }
          onClose={
            handleCloseViewers
          }
        />
      )}
    </div>
  );
};

export default Status;
