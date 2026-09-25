import { useEffect, useRef } from "react";
import { MessageCircle, Loader2 } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const ChatWindow = ({
  selectedChat,
  messages = [],
  messagesLoading,
  onMessageSent,
  onMessageUpdated,
  onBack,
  onStartVideoCall,
  onStartAudioCall,
}) => {
  const messagesEndRef = useRef(null);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    if (!selectedChat) return;

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages, selectedChat]);

  // ==========================================
  // NO CHAT SELECTED
  // ==========================================

  if (!selectedChat) {
    return (
      <div
        className="
          h-full
          min-h-0
          w-full
          flex
          items-center
          justify-center
          bg-[#0b141a]
          px-6
        "
      >
        <div className="text-center max-w-md">
          {/* ICON */}
          <div
            className="
              w-20
              h-20
              sm:w-24
              sm:h-24
              mx-auto
              mb-5
              rounded-full
              bg-[#202c33]
              border
              border-[#2a3942]
              flex
              items-center
              justify-center
              shadow-lg
            "
          >
            <MessageCircle
              size={34}
              className="text-green-400"
            />
          </div>

          {/* TITLE */}
          <h2
            className="
              text-xl
              sm:text-2xl
              font-semibold
              text-white
            "
          >
            Welcome to Connecto
          </h2>

          {/* DESCRIPTION */}
          <p
            className="
              mt-2
              text-sm
              sm:text-base
              leading-6
              text-[#8696a0]
            "
          >
            Select a chat from the sidebar
            to start messaging.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // CHAT
  // ==========================================

  return (
    <div
      className="
        h-full
        min-h-0
        w-full
        min-w-0
        flex
        flex-col
        bg-[#0b141a]
        overflow-hidden
      "
    >
      {/* ======================================
          CHAT HEADER
      ====================================== */}

      <div
        className="
          shrink-0
          w-full
          z-20
        "
      >
        <ChatHeader
          selectedChat={selectedChat}
          onBack={onBack}
          onStartVideoCall={onStartVideoCall}
          onStartAudioCall={onStartAudioCall}
        />
      </div>

      {/* ======================================
          MESSAGES AREA
          ONLY THIS AREA WILL SCROLL
      ====================================== */}

      <div
        className="
          flex-1
          min-h-0
          w-full
          overflow-y-auto
          overflow-x-hidden
          bg-[#0b141a]
          overscroll-contain
          scroll-smooth
          px-2.5
          sm:px-4
          py-3
          sm:py-4
        "
      >
        {/* ====================================
            LOADING
        ==================================== */}

        {messagesLoading ? (
          <div
            className="
              h-full
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-[#202c33]
                  flex
                  items-center
                  justify-center
                "
              >
                <Loader2
                  size={21}
                  className="
                    text-green-400
                    animate-spin
                  "
                />
              </div>

              <p
                className="
                  mt-3
                  text-sm
                  text-[#8696a0]
                "
              >
                Loading messages...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* ==================================
             EMPTY CHAT
          ================================== */

          <div
            className="
              h-full
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                text-center
                px-6
                max-w-sm
              "
            >
              <div
                className="
                  w-16
                  h-16
                  sm:w-20
                  sm:h-20
                  mx-auto
                  mb-4
                  rounded-full
                  bg-[#202c33]
                  border
                  border-[#2a3942]
                  flex
                  items-center
                  justify-center
                "
              >
                <MessageCircle
                  size={28}
                  className="text-green-400"
                />
              </div>

              <p
                className="
                  text-lg
                  sm:text-xl
                  font-medium
                  text-white
                "
              >
                No messages yet
              </p>

              <p
                className="
                  text-sm
                  mt-2
                  leading-6
                  text-[#8696a0]
                "
              >
                Start a conversation with{" "}
                <span className="text-[#d1d7db]">
                  {selectedChat?.name || "this user"}
                </span>
              </p>
            </div>
          </div>
        ) : (
          /* ==================================
             MESSAGE LIST
          ================================== */

          <div
            className="
              w-full
              max-w-5xl
              mx-auto
              space-y-1.5
              sm:space-y-2
            "
          >
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                onMessageUpdated={onMessageUpdated}
              />
            ))}

            {/* AUTO SCROLL TARGET */}
            <div
              ref={messagesEndRef}
              className="h-px w-full"
            />
          </div>
        )}
      </div>

      {/* ======================================
          MESSAGE INPUT
          ALWAYS AT BOTTOM
      ====================================== */}

      <div
        className="
          shrink-0
          w-full
          z-30
          bg-[#202c33]
          border-t
          border-[#2a3942]
          pb-[env(safe-area-inset-bottom)]
        "
      >
        <MessageInput
          selectedChat={selectedChat}
          onMessageSent={onMessageSent}
        />
      </div>
    </div>
  );
};

export default ChatWindow;