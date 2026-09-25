import {
  Phone,
  Video,
  ArrowLeft,
} from "lucide-react";

import Avatar from "../common/Avatar";

const ChatHeader = ({
  selectedChat,
  onBack,
  onStartVideoCall,
  onStartAudioCall,
}) => {
  if (!selectedChat) {
    return null;
  }

  // =========================================
  // FORMAT LAST SEEN
  // =========================================

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) {
      return "last seen recently";
    }

    const date = new Date(lastSeen);

    if (Number.isNaN(date.getTime())) {
      return "last seen recently";
    }

    return `last seen ${date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // =========================================
  // VIDEO CALL
  // =========================================

  const handleVideoCall = () => {
    if (typeof onStartVideoCall === "function") {
      onStartVideoCall(selectedChat);
    }
  };

  // =========================================
  // AUDIO CALL
  // =========================================

  const handleAudioCall = () => {
    if (typeof onStartAudioCall === "function") {
      onStartAudioCall(selectedChat);
    }
  };

  return (
    <header
      className="
        h-[64px]
        sm:h-[70px]
        w-full
        shrink-0
        flex
        items-center
        bg-[#202c33]
        border-b
        border-[#2a3942]
        px-2
        sm:px-4
      "
    >
      {/* =====================================
          MOBILE BACK BUTTON
      ====================================== */}

      <button
        type="button"
        onClick={onBack}
        aria-label="Back to chats"
        title="Back"
        className="
          md:hidden
          shrink-0
          w-10
          h-10
          mr-1
          flex
          items-center
          justify-center
          rounded-full
          text-[#aebac1]
          hover:text-white
          hover:bg-[#2a3942]
          active:bg-[#37434a]
          transition
        "
      >
        <ArrowLeft size={21} />
      </button>

      {/* =====================================
          AVATAR
      ====================================== */}

      <div className="shrink-0">
        <Avatar
          src={selectedChat.profilePicture}
          name={selectedChat.name}
          online={selectedChat.online}
          size="md"
        />
      </div>

      {/* =====================================
          USER INFO
      ====================================== */}

      <div className="
        ml-2.5
        sm:ml-3
        flex-1
        min-w-0
      ">
        <h2
          className="
            text-white
            text-[15px]
            sm:text-base
            font-semibold
            truncate
          "
        >
          {selectedChat.name}
        </h2>

        <p
          className={`
            text-[11px]
            sm:text-xs
            truncate
            mt-0.5
            ${
              selectedChat.online
                ? "text-green-400"
                : "text-[#8696a0]"
            }
          `}
        >
          {selectedChat.online
            ? "online"
            : formatLastSeen(selectedChat.lastSeen)}
        </p>
      </div>

      {/* =====================================
          CALL ACTIONS
      ====================================== */}

      <div className="
        flex
        items-center
        gap-0.5
        sm:gap-1
        shrink-0
      ">

        {/* Video Call */}

        <button
          type="button"
          onClick={handleVideoCall}
          aria-label="Start video call"
          title="Video call"
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            flex
            items-center
            justify-center
            rounded-full
            text-[#aebac1]
            hover:text-white
            hover:bg-[#2a3942]
            active:bg-[#37434a]
            transition
          "
        >
          <Video
            size={19}
            className="sm:w-5 sm:h-5"
          />
        </button>

        {/* Audio Call */}

        <button
          type="button"
          onClick={handleAudioCall}
          aria-label="Start voice call"
          title="Voice call"
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            flex
            items-center
            justify-center
            rounded-full
            text-[#aebac1]
            hover:text-white
            hover:bg-[#2a3942]
            active:bg-[#37434a]
            transition
          "
        >
          <Phone
            size={18}
            className="sm:w-[19px] sm:h-[19px]"
          />
        </button>

      </div>
    </header>
  );
};

export default ChatHeader;