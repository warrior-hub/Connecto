import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  MessageCircle,
  Loader2,
} from "lucide-react";

import Avatar from "../common/Avatar";

const ChatSidebar = ({
  conversations = [],
  users = [],
  selectedChat,
  onSelectChat,
  onSelectUser,
  unreadCounts = {},
  loading,
}) => {
  // ==========================================
  // CURRENT USER
  // ==========================================

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const currentUserId =
    currentUser?._id?.toString() ||
    currentUser?.id?.toString();

  // ==========================================
  // SEARCH
  // ==========================================

  const [search, setSearch] = useState("");

  const searchText = search.trim().toLowerCase();

  // ==========================================
  // GET OTHER USER
  // ==========================================

  const getOtherUser = (conversation) => {
    if (!conversation) {
      return null;
    }

    if (!Array.isArray(conversation.participants)) {
      return null;
    }

    const otherUser = conversation.participants.find(
      (participant) => {
        const participantId =
          participant?._id?.toString();

        return (
          participantId &&
          participantId !== currentUserId
        );
      }
    );

    return otherUser || null;
  };

  // ==========================================
  // BUILD CHAT LIST
  // ==========================================

  const chatList = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }

    const conversationMap = new Map();

    // ========================================
    // STORE CONVERSATIONS BY OTHER USER ID
    // ========================================

    if (Array.isArray(conversations)) {
      conversations.forEach((conversation) => {
        const otherUser =
          getOtherUser(conversation);

        if (!otherUser?._id) {
          return;
        }

        const userId =
          otherUser._id.toString();

        conversationMap.set(
          userId,
          conversation
        );
      });
    }

    // ========================================
    // MERGE USERS + CONVERSATIONS
    // ========================================

    const mergedUsers = users
      .filter((user) => {
        const userId =
          user?._id?.toString() ||
          user?.id?.toString();

        if (!userId) {
          return false;
        }

        // Current user ko sidebar se remove
        if (
          currentUserId &&
          userId === currentUserId
        ) {
          return false;
        }

        return true;
      })
      .map((user) => {
        const userId =
          user?._id?.toString() ||
          user?.id?.toString();

        const conversation =
          conversationMap.get(userId);

        return {
          user,
          conversation: conversation || null,
        };
      });

    // ========================================
    // SORT
    // ========================================

    mergedUsers.sort((a, b) => {
      const aTime =
        a.conversation?.lastMessageAt
          ? new Date(
              a.conversation.lastMessageAt
            ).getTime()
          : 0;

      const bTime =
        b.conversation?.lastMessageAt
          ? new Date(
              b.conversation.lastMessageAt
            ).getTime()
          : 0;

      // Recent conversation first
      if (aTime !== bTime) {
        return bTime - aTime;
      }

      // Otherwise alphabetical
      const aName =
        a.user?.name?.toLowerCase() || "";

      const bName =
        b.user?.name?.toLowerCase() || "";

      return aName.localeCompare(bName);
    });

    return mergedUsers;
  }, [
    users,
    conversations,
    currentUserId,
  ]);

  // ==========================================
  // SEARCH FILTER
  // ==========================================

  const filteredChatList = useMemo(() => {
    if (!searchText) {
      return chatList;
    }

    return chatList.filter(({ user }) => {
      const name =
        user?.name?.toLowerCase() || "";

      const username =
        user?.username?.toLowerCase() || "";

      return (
        name.includes(searchText) ||
        username.includes(searchText)
      );
    });
  }, [chatList, searchText]);

  // ==========================================
  // HANDLE USER CLICK
  // ==========================================

  const handleUserClick = ({
    user,
    conversation,
  }) => {
    // ========================================
    // EXISTING CHAT
    // ========================================

    if (
      conversation?._id &&
      typeof onSelectChat === "function"
    ) {
      onSelectChat(conversation);
      return;
    }

    // ========================================
    // NEW CHAT
    // ========================================

    if (
      typeof onSelectUser === "function"
    ) {
      onSelectUser(user);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <aside className="h-full w-full flex flex-col bg-[#111b21] overflow-hidden">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <header
        className="
          h-[64px]
          sm:h-[70px]
          shrink-0
          flex
          items-center
          justify-between
          px-3
          sm:px-4
          bg-[#202c33]
          border-b
          border-[#2a3942]
        "
      >
        {/* BRAND */}
        <div className="flex items-center gap-3 min-w-0">
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
                text-white
                text-[17px]
                sm:text-lg
                font-semibold
                truncate
              "
            >
              Connecto
            </h1>

            <p
              className="
                text-[10px]
                sm:text-[11px]
                text-[#8696a0]
                truncate
              "
            >
              Stay connected
            </p>
          </div>
        </div>
      </header>

      {/* ====================================== */}
      {/* SEARCH */}
      {/* ====================================== */}

      <div
        className="
          px-3
          sm:px-4
          py-2.5
          sm:py-3
          bg-[#111b21]
          shrink-0
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            h-10
            sm:h-11
            bg-[#202c33]
            rounded-lg
            px-3
            border
            border-transparent
            focus-within:border-[#3b4a54]
            transition
          "
        >
          <Search
            size={18}
            className="
              text-[#8696a0]
              shrink-0
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search or start new chat"
            className="
              flex-1
              min-w-0
              bg-transparent
              text-sm
              text-white
              outline-none
              placeholder:text-[#8696a0]
            "
            aria-label="Search chats"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="
                shrink-0
                text-[#8696a0]
                hover:text-white
                transition
                text-sm
              "
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ====================================== */}
      {/* CHAT LIST */}
      {/* ====================================== */}

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#374045] scrollbar-track-transparent">
        {/* ==================================== */}
        {/* SECTION TITLE */}
        {/* ==================================== */}

        {filteredChatList.length > 0 && (
          <div
            className="
              px-4
              pt-2
              pb-1.5
              text-[11px]
              uppercase
              tracking-wider
              font-medium
              text-[#8696a0]
            "
          >
            {searchText ? "Search results" : "Chats"}
          </div>
        )}

        {/* ==================================== */}
        {/* USERS / CHATS */}
        {/* ==================================== */}

        {filteredChatList.map(
          ({ user, conversation }) => {
            const userId =
              user?._id?.toString() ||
              user?.id?.toString();

            const isSelected =
              selectedChat?.userId?.toString() ===
              userId;

            const conversationId =
              conversation?._id?.toString();

            const unreadCount =
              conversationId
                ? unreadCounts[conversationId] || 0
                : 0;

            // ==================================
            // LAST MESSAGE
            // ==================================

            const lastMessage =
              conversation?.lastMessage;

            let lastMessageText =
              lastMessage?.text?.trim() ||
              "";

            if (!lastMessageText) {
              if (
                lastMessage?.messageType ===
                "image"
              ) {
                lastMessageText = "📷 Image";
              } else {
                lastMessageText =
                  "No messages yet";
              }
            }

            // ==================================
            // TIME
            // ==================================

            const lastMessageTime =
              conversation?.lastMessageAt
                ? new Date(
                    conversation.lastMessageAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

            return (
              <button
                key={userId}
                type="button"
                onClick={() =>
                  handleUserClick({
                    user,
                    conversation,
                  })
                }
                className={`
                  group
                  w-full
                  flex
                  items-center
                  gap-3
                  px-3
                  sm:px-4
                  py-2.5
                  sm:py-3
                  text-left
                  transition
                  cursor-pointer
                  border-b
                  border-[#202c33]

                  ${
                    isSelected
                      ? "bg-[#2a3942]"
                      : "hover:bg-[#202c33]"
                  }
                `}
              >
                {/* ================================= */}
                {/* AVATAR */}
                {/* ================================= */}

                <div className="shrink-0">
                  <Avatar
                    src={user?.profilePicture}
                    name={user?.name}
                    online={user?.online}
                    size="lg"
                  />
                </div>

                {/* ================================= */}
                {/* USER INFO */}
                {/* ================================= */}

                <div
                  className="
                    flex-1
                    min-w-0
                    py-0.5
                  "
                >
                  {/* NAME + TIME */}
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-2
                    "
                  >
                    <h3
                      className="
                        text-white
                        text-[14px]
                        sm:text-[15px]
                        font-medium
                        truncate
                      "
                    >
                      {user?.name ||
                        "Unknown User"}
                    </h3>

                    {lastMessageTime && (
                      <span
                        className={`
                          text-[10px]
                          sm:text-[11px]
                          shrink-0

                          ${
                            unreadCount > 0
                              ? "text-green-400"
                              : "text-[#8696a0]"
                          }
                        `}
                      >
                        {lastMessageTime}
                      </span>
                    )}
                  </div>

                  {/* MESSAGE + UNREAD */}
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-2
                      mt-1
                    "
                  >
                    <p
                      className={`
                        text-[12px]
                        sm:text-sm
                        truncate
                        ${
                          unreadCount > 0
                            ? "text-[#d1d7db]"
                            : "text-[#8696a0]"
                        }
                      `}
                    >
                      {lastMessageText}
                    </p>

                    {unreadCount > 0 && (
                      <span
                        className="
                          min-w-[19px]
                          h-[19px]
                          px-1
                          flex
                          items-center
                          justify-center
                          rounded-full
                          bg-green-500
                          text-black
                          text-[10px]
                          font-bold
                          shrink-0
                        "
                      >
                        {unreadCount > 99
                          ? "99+"
                          : unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          }
        )}

        {/* ==================================== */}
        {/* LOADING */}
        {/* ==================================== */}

        {loading && (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              py-10
              px-6
              text-[#8696a0]
            "
          >
            <Loader2
              size={24}
              className="animate-spin mb-3"
            />

            <p className="text-sm">
              Loading chats...
            </p>
          </div>
        )}

        {/* ==================================== */}
        {/* SEARCH EMPTY */}
        {/* ==================================== */}

        {!loading &&
          searchText &&
          filteredChatList.length === 0 && (
            <div
              className="
                flex
                flex-col
                items-center
                text-center
                px-6
                py-12
                text-[#8696a0]
              "
            >
              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-[#202c33]
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <Search
                  size={25}
                  className="opacity-70"
                />
              </div>

              <p
                className="
                  text-sm
                  text-[#d1d7db]
                  font-medium
                "
              >
                No results found
              </p>

              <p
                className="
                  text-xs
                  mt-1.5
                  text-[#8696a0]
                "
              >
                Try another name or username
              </p>
            </div>
          )}

        {/* ==================================== */}
        {/* NO USERS */}
        {/* ==================================== */}

        {!loading &&
          !searchText &&
          filteredChatList.length === 0 && (
            <div
              className="
                flex
                flex-col
                items-center
                text-center
                px-6
                py-12
                text-[#8696a0]
              "
            >
              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-[#202c33]
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <MessageCircle
                  size={25}
                  className="opacity-70"
                />
              </div>

              <p
                className="
                  text-sm
                  text-[#d1d7db]
                  font-medium
                "
              >
                No users available
              </p>

              <p
                className="
                  text-xs
                  mt-1.5
                  text-[#8696a0]
                "
              >
                Users you can chat with will
                appear here.
              </p>
            </div>
          )}
      </div>
    </aside>
  );
};

export default ChatSidebar;